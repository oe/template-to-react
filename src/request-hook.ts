const REQUEST_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'] as const
const DATA_TYPE = ['JSON', 'FORM'] as const

type IRequestMethod = typeof REQUEST_METHODS[number]
type IDataType = typeof DATA_TYPE[number]

type ICombinedType = IRequestMethod | IDataType

export type IRequestFn = {
  [k in ICombinedType]: IRequestFn
} &  {
  [k in Lowercase<ICombinedType>]: IRequestFn
} & {
  (url: string, config?: RequestInit): Promise<Response>
}

function createRequest(options, extra?: { method: IRequestMethod, dataType: IDataType }) {
  const fn = () => {}
  return new Proxy(fn, {
    async apply(target, thisArg, args: any[]) {
      const url = args[0]
      const config = Object.assign({}, args[1])
      config.method = config.method || extra?.method || 'GET'
      const response = await fetch(url, config)
      return response
    },
    get (target, p: string, receiver): IRequestFn {
      const key = p.toUpperCase()
      // @ts-ignore
      if (REQUEST_METHODS.includes(key)) {
        if (extra && extra.method ) {
          if (extra.method !== key) {
            throw new Error(`method already set to ${extra.method}`);
          } else {
            return receiver
          }
        }
        const newExtra = Object.assign({}, extra, { method: key as IRequestMethod})
        return createRequest(options, newExtra)
      }
      // @ts-ignore
      if (DATA_TYPE.includes(key)) {
        if (extra && extra.dataType) {
          if (extra.dataType !== key) {
            throw new Error(`data type already set to ${extra.dataType}`);
          } else {
            return receiver
          }
        }
        const newExtra = Object.assign({}, extra, { dataType: p as IDataType })
        return createRequest(options, newExtra)
      }
      throw new Error(`unknown method or data type ${p}`);
    },
  }) as unknown as IRequestFn
}


function createRequestInstance(options) {
  const promise: Promise<any> = options.promise
  return new Proxy(promise, {
    get(target, p: string, receiver) {
      if (p === 'capture') {
        return (fn: () => void) => {
          const result = target.catch(fn)
          if (!options.fallbackReject) return result
          return result.catch(options.fallbackReject)
        }
      }
      if (p === 'thus') {
        return (fn: () => void) => {
          const result = target.then(fn)
          if (!options.fallbackReject) return result
          return result.then(options.fallbackReject)
        }
      }
      return Reflect.get(target, p, receiver)
    }
  })
}


const request = createRequest({})
request.form.json('http://localhost:3000', { method: 'GET' }).then(console.log).catch(console.error).finally(console.log)