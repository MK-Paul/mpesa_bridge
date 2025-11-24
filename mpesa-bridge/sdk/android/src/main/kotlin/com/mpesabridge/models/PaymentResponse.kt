package com.mpesabridge.models

data class PaymentResponse(
    val success: Boolean,
    val message: String,
    val transactionId: String,
    val status: String
)
