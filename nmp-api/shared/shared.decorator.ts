// Define a custom decorator `IsRequired`
export function IsEnvironmentRequired(envVarName: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      if (!process.env[envVarName]) {
        throw new Error(`Environment variable ${envVarName} is required.`);
      }
      return originalMethod.apply(this, args);
    };
    return descriptor;
  };
}
