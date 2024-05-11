
export interface IAsyncFnHookOptions<T> {
  unifyArgs?: (...args: any[]) => T
  argsHooks?: ((arg: T) => Promise<T> | T)[]
  resolveHooks?: ((arg: any) => Promise<any> | any)[]
  rejectHooks?: ((arg: any) => Promise<any> | any)[]
  finallyHooks?: ((resolved: boolean, arg: any) => Promise<any> | any)[]
}


export function createAsyncFnHook<T>
  (fn: (arg: T) => any, options: IAsyncFnHookOptions<T>) {

  async function hookedFn (...args: any[]) {
    const { unifyArgs, argsHooks, resolveHooks, rejectHooks, finallyHooks } = options
    const unifiedArgs = (unifyArgs ? unifyArgs(...args) : args) as T
    let arg = unifiedArgs
    if (argsHooks?.length) {
      for (let index = 0; index < argsHooks.length; index++) {
        const element = argsHooks[index];
        arg = await element(arg)
      }
    }
    let result: any, threwError: any
    let hasError = false
    try {
      result = await fn(arg)
      if (resolveHooks?.length) {
        for (let index = 0; index < resolveHooks.length; index++) {
          const element = resolveHooks[index];
          result = await element(result)
        }
      }
    } catch (error) {
      hasError = true
      threwError = error
      if (rejectHooks?.length) {
        for (let index = 0; index < rejectHooks.length; index++) {
          const element = rejectHooks[index];
          threwError = await element(threwError)
        }
      }
    } finally {
      if (finallyHooks?.length) {
        for (let index = 0; index < finallyHooks.length; index++) {
          const element = finallyHooks[index];
          result = await element(!hasError, hasError ? threwError : result)
        }
      }
    }
  }

  return hookedFn
}

// request.post.json('http://localhost:3000', { data: 'data' }).then(console.log).catch(console.error).finally(console.log)

