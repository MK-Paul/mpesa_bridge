import Foundation
import SocketIO

public class MpesaBridge {
    private let apiKey: String
    private let baseUrl: String
    private var manager: SocketManager?
    private var socket: SocketIOClient?

    public init(apiKey: String, baseUrl: String = "https://mpesa-bridge.onrender.com/api/v1") {
        self.apiKey = apiKey
        self.baseUrl = baseUrl
    }

    /// Initiate an STK Push payment
    public func pay(params: PaymentParams, completion: @escaping (Result<PaymentResponse, Error>) -> Void) {
        guard let url = URL(string: "\(baseUrl)/transactions/stk-push") else {
            completion(.failure(NSError(domain: "MpesaBridge", code: 400, userInfo: [NSLocalizedDescriptionKey: "Invalid URL"])))
            return
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(apiKey, forHTTPHeaderField: "x-api-key")

        let body: [String: Any] = [
            "phoneNumber": params.phone,
            "amount": params.amount,
            "reference": params.reference,
            "description": params.description ?? "Payment for \(params.reference)"
        ]

        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: body)
        } catch {
            completion(.failure(error))
            return
        }

        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }

            guard let data = data else {
                completion(.failure(NSError(domain: "MpesaBridge", code: 500, userInfo: [NSLocalizedDescriptionKey: "No data received"])))
                return
            }

            do {
                if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any],
                   let success = json["success"] as? Bool, success,
                   let dataObj = json["data"] as? [String: Any],
                   let transactionId = dataObj["transactionId"] as? String,
                   let status = dataObj["status"] as? String {
                    
                    let response = PaymentResponse(
                        success: true,
                        message: json["message"] as? String ?? "",
                        transactionId: transactionId,
                        status: status
                    )
                    completion(.success(response))
                } else {
                    completion(.failure(NSError(domain: "MpesaBridge", code: 400, userInfo: [NSLocalizedDescriptionKey: "Payment failed"])))
                }
            } catch {
                completion(.failure(error))
            }
        }.resume()
    }

    /// Subscribe to real-time transaction updates
    public func subscribeToUpdates(transactionId: String, completion: @escaping (TransactionStatus) -> Void) {
        if manager == nil {
            let socketUrl = URL(string: baseUrl.replacingOccurrences(of: "/api/v1", with: ""))!
            manager = SocketManager(socketURL: socketUrl, config: [.log(false), .compress])
            socket = manager?.defaultSocket
        }

        socket?.on(clientEvent: .connect) {data, ack in
            self.socket?.emit("join-transaction", transactionId)
        }

        socket?.on("transaction-update") { data, ack in
            guard let dict = data[0] as? [String: Any],
                  let txId = dict["transactionId"] as? String,
                  txId == transactionId else { return }

            do {
                let jsonData = try JSONSerialization.data(withJSONObject: dict)
                let status = try JSONDecoder().decode(TransactionStatus.self, from: jsonData)
                completion(status)
            } catch {
                print("Error decoding transaction status: \(error)")
            }
        }

        socket?.connect()
    }
}
