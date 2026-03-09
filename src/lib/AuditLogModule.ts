import { NativeModules } from 'react-native';

const { AuditLogModule } = NativeModules;

export function writeAuditLog(content: string): Promise<string> {
  return AuditLogModule.writeLog(content);
}
