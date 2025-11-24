// swift-tools-version:5.5
import PackageDescription

let package = Package(
    name: "MpesaBridge",
    platforms: [
        .iOS(.v13)
    ],
    products: [
        .library(
            name: "MpesaBridge",
            targets: ["MpesaBridge"]),
    ],
    dependencies: [
        .package(url: "https://github.com/socketio/socket.io-client-swift", .upToNextMajor(from: "16.0.0"))
    ],
    targets: [
        .target(
            name: "MpesaBridge",
            dependencies: [
                .product(name: "SocketIO", package: "socket.io-client-swift")
            ],
            path: "Sources/MpesaBridge"
        ),
    ]
)
