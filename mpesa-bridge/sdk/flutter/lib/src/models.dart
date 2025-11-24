class PaymentParams {
  final String phone;
  final double amount;
  final String reference;
  final String? description;

  PaymentParams({
    required this.phone,
    required this.amount,
    required this.reference,
    this.description,
  });

  Map<String, dynamic> toJson() {
    return {
      'phoneNumber': phone,
      'amount': amount,
      'reference': reference,
      'description': description ?? 'Payment for $reference',
    };
  }
}

class PaymentResponse {
  final bool success;
  final String message;
  final String transactionId;
  final String status;

  PaymentResponse({
    required this.success,
    required this.message,
    required this.transactionId,
    required this.status,
  });

  factory PaymentResponse.fromJson(Map<String, dynamic> json) {
    return PaymentResponse(
      success: true,
      message: json['message'] ?? '',
      transactionId: json['data']['transactionId'],
      status: json['data']['status'],
    );
  }
}

class TransactionStatus {
  final String transactionId;
  final String status;
  final String? mpesaReceipt;
  final String? message;
  final double? amount;
  final String? phoneNumber;
  final String? reference;

  TransactionStatus({
    required this.transactionId,
    required this.status,
    this.mpesaReceipt,
    this.message,
    this.amount,
    this.phoneNumber,
    this.reference,
  });

  factory TransactionStatus.fromJson(Map<String, dynamic> json) {
    return TransactionStatus(
      transactionId: json['transactionId'],
      status: json['status'],
      mpesaReceipt: json['mpesaReceipt'],
      message: json['message'],
      amount: json['amount'] != null ? (json['amount'] as num).toDouble() : null,
      phoneNumber: json['phoneNumber'],
      reference: json['reference'],
    );
  }
}
