const baseUrl = 'http://127.0.0.1:5000/'

export const refreshUrl = baseUrl + 'api/refresh'
export const loginUrl = baseUrl + 'api/authorization/login'
export const formsUrl = baseUrl + 'api/forms/forms'
export const singleFormUrl = (formId: number) => baseUrl + `api/single-form/${formId}`
