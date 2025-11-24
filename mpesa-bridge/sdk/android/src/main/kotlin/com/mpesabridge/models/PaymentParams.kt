package com.mpesabridge.models

data class PaymentParams(
    val phone: String,
    val amount: Double,
    val reference: String,
    val description: String? = null
)
