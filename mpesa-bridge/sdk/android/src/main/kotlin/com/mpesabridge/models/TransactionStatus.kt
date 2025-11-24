package com.mpesabridge.models

data class TransactionStatus(
    val transactionId: String,
    val status: String,
    val mpesaReceipt: String?,
    val message: String?,
    val amount: Double?,
    val phoneNumber: String?,
    val reference: String?
)
