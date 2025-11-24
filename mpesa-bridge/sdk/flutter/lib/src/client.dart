import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:socket_io_client/socket_io_client.dart' as io;
import 'models.dart';

class MpesaBridge {
  final String apiKey;
  final String baseUrl;
  io.Socket? _socket;

  MpesaBridge({
    required this.apiKey,
    this.baseUrl = 'https://mpesa-bridge.onrender.com/api/v1',
  });

  /// Initiate an STK Push payment
  Future<PaymentResponse> pay(PaymentParams params) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/transactions/stk-push'),
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: jsonEncode(params.toJson()),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return PaymentResponse.fromJson(jsonDecode(response.body));
      } else {
        final error = jsonDecode(response.body);
        throw Exception(error['message'] ?? 'Payment initiation failed');
      }
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  /// Subscribe to real-time transaction updates
  void subscribeToUpdates(String transactionId, Function(TransactionStatus) onUpdate) {
    if (_socket == null) {
      final socketUrl = baseUrl.replaceAll('/api/v1', '');
      _socket = io.io(socketUrl, <String, dynamic>{
        'transports': ['websocket'],
        'autoConnect': true,
      });
    }

    _socket!.emit('join-transaction', transactionId);

    _socket!.on('transaction-update', (data) {
      if (data['transactionId'] == transactionId) {
        onUpdate(TransactionStatus.fromJson(data));
      }
    });
  }

  /// Manually check transaction status
  Future<TransactionStatus> getStatus(String transactionId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/transactions/$transactionId'),
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
      );

      if (response.statusCode == 200) {
        final json = jsonDecode(response.body);
        return TransactionStatus.fromJson(json['data']);
      } else {
        throw Exception('Failed to get status');
      }
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  /// Dispose socket connection
  void dispose() {
    _socket?.disconnect();
    _socket = null;
  }
}
