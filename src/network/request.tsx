import { refreshUrl } from "./urls"

export const authorizedRequest = async (url: string, method: string, tokenType = 'accessToken', body?: object) => {
	// try {
	const token = localStorage.getItem(tokenType)
	
	const request: object = body ? {
		method: method,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(body)
	} : {
		method: method,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		}
	}

	if (!token || token === '') {
		window.location.href = '/log-in'
		return 403
	}

	const response = await fetch(url, request)
	if (response.status === 200 || response.status === 201) {
		return await response.json()
	}else if(response.status === 404){
		window.location.href = '/'
		// localStorage.setItem(tokenType, '');
		return response.status
	}else if(response.status === 403){
		window.location.href = '/'
		return response.status
	}else if(response.status === 401){

		authorizedRequest(refreshUrl, 'GET', 'refreshToken').then((data) => {
			if(data.result){
				localStorage.setItem('accessToken', data.result.access_token)
				authorizedRequest(url, method, tokenType, body)
			}else{
				localStorage.removeItem('accessToken')
				localStorage.removeItem('refreshToken')
				window.location.href = '/log-in'
			}
		})
			
		return response.status
	}
	// } catch {
	// 	window.location.href = 'https://ri-software.com.ua/error/500'
	// }
}

export const unauthorizedRequest = async (url: string, method: string, body?: object) => {
	const request: object = body ? {
		method: method,
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body)

	} : {
		method: method,
		headers: {
			'Content-Type': 'application/json',
		}
	}

	const response = await fetch(url, request) 

	if (response.status === 200) {
		return await response.json()
	} else {
		return response.status
	}
}
