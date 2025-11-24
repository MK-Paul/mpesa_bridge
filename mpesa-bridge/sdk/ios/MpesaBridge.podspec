Pod::Spec.new do |s|
  s.name             = 'MpesaBridge'
  s.version          = '0.1.0'
  s.summary          = 'Official iOS SDK for M-Pesa Bridge API'
  s.description      = <<-DESC
                       MpesaBridge allows you to easily integrate M-Pesa payments into your iOS application.
                       It supports STK Push and real-time transaction updates.
                       DESC
  s.homepage         = 'https://github.com/MK-Paul/mpesa_bridge'
  s.license          = { :type => 'MIT', :file => 'LICENSE' }
  s.author           = { 'M-Pesa Bridge' => 'support@mpesabridge.com' }
  s.source           = { :git => 'https://github.com/MK-Paul/mpesa_bridge.git', :tag => s.version.to_s }
  s.ios.deployment_target = '13.0'
  s.swift_version    = '5.0'
  s.source_files     = 'Sources/MpesaBridge/**/*'
  s.dependency 'Socket.IO-Client-Swift', '~> 16.0.0'
end
