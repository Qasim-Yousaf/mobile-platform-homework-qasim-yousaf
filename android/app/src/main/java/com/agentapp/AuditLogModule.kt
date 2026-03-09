package com.agentapp

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import java.io.File

class AuditLogModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "AuditLogModule"

  @ReactMethod
  fun writeLog(content: String, promise: Promise) {
    try {
      val docsDir = reactApplicationContext.getExternalFilesDir(null)
        ?: reactApplicationContext.filesDir
      val file = File(docsDir, "agent_audit_log.txt")
      file.writeText(content)
      promise.resolve(file.absolutePath)
    } catch (e: Exception) {
      promise.reject("ERR_WRITE_FAILED", e.message, e)
    }
  }
}
