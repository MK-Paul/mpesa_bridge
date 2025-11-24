package com.mpesabridge

import com.mpesabridge.models.PaymentParams
import com.mpesabridge.models.PaymentResponse
import com.mpesabridge.models.TransactionStatus
import io.socket.client.IO
import io.socket.client.Socket
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.Path
import com.google.gson.Gson
import org.json.JSONObject

interface MpesaApi {
    @POST("transactions/stk-push")
    suspend fun pay(
        @Header("x-api-key") apiKey: String,
        @Body params: Map<String, Any>
    ): retrofit2.Response<ApiResponse<PaymentData>>

    @GET("transactions/{id}")
    suspend fun getStatus(
        @Header("x-api-key") apiKey: String,
        @Path("id") id: String
    ): retrofit2.Response<ApiResponse<TransactionStatus>>
}

data class ApiResponse<T>(
    val success: Boolean,
    val message: String,
    val data: T
)

data class PaymentData(
    val transactionId: String,
    val status: String
)

class MpesaBridge(
    private val apiKey: String,
    private val baseUrl: String = "https://mpesa-bridge.onrender.com/api/v1/"
) {
    private val api: MpesaApi
    private var socket: Socket? = null
    private val gson = Gson()

    init {
        val retrofit = Retrofit.Builder()
            .baseUrl(baseUrl)
            .addConverterFactory(GsonConverterFactory.create())
            .build()

        api = retrofit.create(MpesaApi::class.java)
    }

    suspend fun pay(params: PaymentParams): Result<PaymentResponse> {
        return try {
            val body = mapOf(
                "phoneNumber" to params.phone,
                "amount" to params.amount,
                "reference" to params.reference,
                "description" to (params.description ?: "Payment for ${params.reference}")
            )

            val response = api.pay(apiKey, body)
            if (response.isSuccessful && response.body() != null) {
                val data = response.body()!!.data
                Result.success(
                    PaymentResponse(
                        success = true,
                        message = response.body()!!.message,
                        transactionId = data.transactionId,
                        status = data.status
                    )
                )
            } else {
                Result.failure(Exception(response.errorBody()?.string() ?: "Payment failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun subscribeToUpdates(transactionId: String, callback: (TransactionStatus) -> Unit) {
        if (socket == null) {
            val socketUrl = baseUrl.replace("/api/v1/", "")
            val opts = IO.Options()
            opts.transports = arrayOf("websocket")
            socket = IO.socket(socketUrl, opts)
            socket?.connect()
        }

        socket?.emit("join-transaction", transactionId)

        socket?.on("transaction-update") { args ->
            if (args.isNotEmpty()) {
                val data = args[0] as JSONObject
                if (data.optString("transactionId") == transactionId) {
                    val status = gson.fromJson(data.toString(), TransactionStatus::class.java)
                    callback(status)
                }
            }
        }
    }

    suspend fun getStatus(transactionId: String): Result<TransactionStatus> {
        return try {
            val response = api.getStatus(apiKey, transactionId)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!.data)
            } else {
                Result.failure(Exception("Failed to get status"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun dispose() {
        socket?.disconnect()
        socket = null
    }
}
