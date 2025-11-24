import Foundation

public struct PaymentParams: Codable {
    public let phone: String
    public let amount: Double
    public let reference: String
    public let description: String?

    public init(phone: String, amount: Double, reference: String, description: String? = nil) {
        self.phone = phone
        self.amount = amount
        self.reference = reference
        self.description = description
    }
}

public struct PaymentResponse: Codable {
    public let success: Bool
    public let message: String
    public let transactionId: String
    public let status: String
}

public struct TransactionStatus: Codable {
    public let transactionId: String
    public let status: String
    public let mpesaReceipt: String?
    public let message: String?
    public let amount: Double?
    public let phoneNumber: String?
    public let reference: String?
}
