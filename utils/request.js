import { useUserStore } from '@/stores/user'

const baseURL = 'http://localhost:5000'

const request = {
	get: (url, options = {}) => sendRequest({ url, method: 'GET', ...options }),
	post: (url, data, options = {}) => sendRequest({ url, method: 'POST', data, ...options }),
	put: (url, data, options = {}) => sendRequest({ url, method: 'PUT', data, ...options }),
	delete: (url, options = {}) => sendRequest({ url, method: 'DELETE', ...options })
}

const sendRequest = (options) => {
	return new Promise((resolve, reject) => {
		// 使用 pinia store 获取 token，而不是直接从storage获取
		const userStore = useUserStore()
		const token = userStore.token
		
		console.log('【Request】开始发送请求:', options.url)
		console.log('【Request】当前token:', token)
		console.log('【Request】当前页面栈:', getCurrentPages().map(page => page.route))
		
		// 判断是否是认证相关的请求（登录或注册）
		const isAuthRequest = options.url.includes('/auth/')
		console.log('【Request】是否是认证请求:', isAuthRequest)
		
		// 如果不是认证请求，且没有token，则跳转到登录页
		if (!isAuthRequest && !token) {
			console.log('【Request】未登录状态，token不存在')
			uni.showToast({
				title: '请先登录',
				icon: 'none'
			})
			
			// 获取当前页面栈
			const pages = getCurrentPages()
			// 如果当前不在登录页，才跳转
			if (pages.length > 0 && !pages[pages.length - 1].route.includes('login')) {
				console.log('【Request】准备跳转到登录页')
				uni.reLaunch({
					url: '/pages/login/login'
				})
			}
			reject(new Error('请先登录'))
			return
		}
		
		// 合并请求头
		const header = {
			'Content-Type': 'application/json',
			...options.header
		}
		
		// 如果有token且不是认证请求，添加到请求头
		if (token && !isAuthRequest) {
			header.Authorization = token
		}
		console.log('【Request】最终请求头:', header)
		
		uni.request({
			url: baseURL + options.url,
			method: options.method,
			data: options.data,
			header,
			success: (res) => {
				console.log('【Request】请求响应:', res)
				if (res.statusCode === 200) {
					resolve(res)
				} else if (res.statusCode === 401) {
					console.log('【Request】token过期，需要重新登录')
					// token过期，使用store的logout方法处理
					userStore.logout()
					reject(new Error('登录已过期'))
				} else {
					console.log('【Request】请求失败:', res.data)
					reject(res.data)
				}
			},
			fail: (err) => {
				console.log('【Request】请求错误:', err)
				reject(err)
			}
		})
	})
}

export default request 