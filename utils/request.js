import { useUserStore } from '@/stores/user'

// 基础配置
const baseConfig = {
	baseUrl: 'http://localhost:5000',  // 直接指定后端服务器地址
	timeout: 10000
}

// 创建请求对象
const request = {
	get: (url, config = {}) => sendRequest({ ...config, url: baseConfig.baseUrl + url, method: 'GET' }),
	post: (url, data, config = {}) => sendRequest({ ...config, url: baseConfig.baseUrl + url, method: 'POST', data }),
	put: (url, data, config = {}) => sendRequest({ ...config, url: baseConfig.baseUrl + url, method: 'PUT', data }),
	delete: (url, config = {}) => sendRequest({ ...config, url: baseConfig.baseUrl + url, method: 'DELETE' })
}

// 发送请求
const sendRequest = (config) => {
	return new Promise((resolve, reject) => {
		const userStore = useUserStore()
		const token = userStore.token
		
		// 合并配置
		const finalConfig = {
			...baseConfig,
			...config,
			header: {
				'Content-Type': 'application/json',
				...config.header
			}
		}
		
		// 添加token
		if (token && !config.skipAuth) {
			finalConfig.header.Authorization = `Bearer ${token}`
		}
		
		uni.request({
			...finalConfig,
			success: async (response) => {
				const { statusCode, data } = response
				
				// 处理业务错误
				if (statusCode >= 200 && statusCode < 300) {
					resolve(response)
				} else if (statusCode === 401) {
					// token过期，尝试刷新
					try {
						await handleTokenExpired()
						// 重新发送请求
						const newResponse = await sendRequest(config)
						resolve(newResponse)
					} catch (error) {
						reject(error)
					}
				} else {
					reject({
						message: data.message || '请求失败',
						response
					})
				}
			},
			fail: (error) => {
				reject({
					message: '网络请求失败',
					error
				})
			}
		})
	})
}

// 处理token过期
const handleTokenExpired = async () => {
	const userStore = useUserStore()
	
	try {
		// 刷新token
		await userStore.refreshAccessToken()
		return true
	} catch (error) {
		// 刷新失败，退出登录
		userStore.logout()
		throw new Error('登录已过期，请重新登录')
	}
}

export default request 