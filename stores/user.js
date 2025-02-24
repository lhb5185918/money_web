import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '@/utils/request'

export const useUserStore = defineStore('user', () => {
	const token = ref('')
	const refreshToken = ref('')
	const userInfo = ref(null)
	
	// 登录
	const login = async (data) => {
		try {
			const res = await request.post('/api/auth/login', data)
			
			// 保存token和用户信息
			token.value = res.data.access_token
			refreshToken.value = res.data.refresh_token
			userInfo.value = res.data.user
			
			// 保存到本地存储
			uni.setStorageSync('access_token', res.data.access_token)
			uni.setStorageSync('refresh_token', res.data.refresh_token)
			uni.setStorageSync('user_info', res.data.user)
			
			return true
		} catch (error) {
			throw error
		}
	}
	
	// 注册
	const register = async (data) => {
		try {
			const res = await request.post('/api/auth/register', data)
			return res.data
		} catch (error) {
			throw error
		}
	}
	
	// 获取用户信息
	const getUserInfo = async () => {
		try {
			const res = await request.get('/api/auth/me')
			userInfo.value = res.data
			return res.data
		} catch (error) {
			throw error
		}
	}
	
	// 刷新token
	const refreshAccessToken = async () => {
		try {
			const res = await request.post('/api/auth/refresh', null, {
				headers: {
					'Authorization': `Bearer ${refreshToken.value}`
				}
			})
			
			token.value = res.data.access_token
			uni.setStorageSync('access_token', res.data.access_token)
			
			return res.data.access_token
		} catch (error) {
			throw error
		}
	}
	
	// 退出登录
	const logout = () => {
		token.value = ''
		refreshToken.value = ''
		userInfo.value = null
		
		uni.removeStorageSync('access_token')
		uni.removeStorageSync('refresh_token')
		uni.removeStorageSync('user_info')
		
		// 跳转到登录页
		uni.reLaunch({
			url: '/pages/login/login'
		})
	}
	
	// 初始化状态
	const initState = () => {
		const accessToken = uni.getStorageSync('access_token')
		const refreshTokenStorage = uni.getStorageSync('refresh_token')
		const userInfoStorage = uni.getStorageSync('user_info')
		
		if (accessToken) token.value = accessToken
		if (refreshTokenStorage) refreshToken.value = refreshTokenStorage
		if (userInfoStorage) userInfo.value = userInfoStorage
	}
	
	return {
		token,
		refreshToken,
		userInfo,
		login,
		register,
		getUserInfo,
		refreshAccessToken,
		logout,
		initState
	}
}) 