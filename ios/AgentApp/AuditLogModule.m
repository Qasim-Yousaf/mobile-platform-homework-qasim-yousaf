#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(AuditLogModule, NSObject)

RCT_EXTERN_METHOD(writeLog:(NSString *)content
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
