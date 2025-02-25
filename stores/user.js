import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '@/utils/request'

export const useUserStore = defineStore('user', () => {
	const token = ref('')
	const userInfo = ref(null)
	
	// 登录
	const login = async (data) => {
		try {
			const res = await request.post('/api/auth/login', data)
			console.log('【UserStore】登录响应:', res.data)
			
			if (res.data && res.data.data && res.data.data.token) {
				// 保存token和用户信息
				token.value = res.data.data.token
				userInfo.value = res.data.data.user
				
				// 保存到本地存储
				uni.setStorageSync('token', res.data.data.token)
				uni.setStorageSync('user_info', res.data.data.user)
				
				console.log('【UserStore】Token已保存:', token.value)
				return true
			}
			throw new Error('登录响应中没有token')
		} catch (error) {
			console.error('【UserStore】登录失败:', error)
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
			// 由于没有/me接口，我们直接返回本地存储的用户信息
			const userInfoStorage = uni.getStorageSync('user_info')
			if (userInfoStorage) {
				userInfo.value = userInfoStorage
				return userInfoStorage
			}
			throw new Error('未找到用户信息')
		} catch (error) {
			throw error
		}
	}
	
	// 退出登录
	const logout = () => {
		token.value = ''
		userInfo.value = null
		
		uni.removeStorageSync('token')
		uni.removeStorageSync('user_info')
		
		// 跳转到登录页
		uni.reLaunch({
			url: '/pages/login/login'
		})
	}
	
	// 初始化状态
	const initState = async () => {
		try {
			console.log('【UserStore】开始初始化状态')
			const storedToken = uni.getStorageSync('token')
			const userInfoStorage = uni.getStorageSync('user_info')
			
			console.log('【UserStore】存储的token:', storedToken)
			console.log('【UserStore】存储的用户信息:', userInfoStorage)
			
			if (storedToken && userInfoStorage) {
				token.value = storedToken
				userInfo.value = userInfoStorage
				console.log('【UserStore】用户状态初始化成功')
				return true
			}
			
			console.log('【UserStore】没有找到token或用户信息')
			return false
		} catch (error) {
			console.error('【UserStore】初始化状态失败:', error)
			return false
		}
	}
	
	return {
		token,
		userInfo,
		login,
		register,
		getUserInfo,
		logout,
		initState
	}
}) 