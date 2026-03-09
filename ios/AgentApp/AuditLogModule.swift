import Foundation

@objc(AuditLogModule)
class AuditLogModule: NSObject {

  @objc
  func writeLog(_ content: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    let filename = "agent_audit_log.txt"
    let fileManager = FileManager.default
    guard let docsDir = fileManager.urls(for: .documentDirectory, in: .userDomainMask).first else {
      reject("ERR_NO_DOCS_DIR", "Could not access documents directory", nil)
      return
    }
    let fileURL = docsDir.appendingPathComponent(filename)
    do {
      try content.write(to: fileURL, atomically: true, encoding: .utf8)
      resolve(fileURL.path)
    } catch {
      reject("ERR_WRITE_FAILED", error.localizedDescription, error)
    }
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
