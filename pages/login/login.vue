<template>
	<view class="login-container">
		<view class="login-box">
			<view class="title">登录</view>
			<view class="form">
				<uni-forms :model="formData" :rules="rules" ref="form">
					<uni-forms-item name="username">
						<uni-easyinput
							type="text"
							v-model="formData.username"
							placeholder="请输入用户名"
							:clearable="true"
						/>
					</uni-forms-item>
					
					<uni-forms-item name="password">
						<uni-easyinput
							type="password"
							v-model="formData.password"
							placeholder="请输入密码"
							:clearable="true"
						/>
					</uni-forms-item>
				</uni-forms>
				
				<button class="login-btn" @click="handleLogin">登录</button>
				
				<view class="register-link">
					还没有账号？<text @click="goToRegister">立即注册</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 表单数据
const form = ref(null)
const formData = reactive({
	username: '',
	password: ''
})

// 初始化
onMounted(() => {
	// 初始化用户状态
	userStore.initState()
})

// 表单验证规则
const rules = {
	username: {
		rules: [{
			required: true,
			errorMessage: '请输入用户名'
		}, {
			minLength: 3,
			maxLength: 50,
			errorMessage: '用户名长度应在3-50个字符之间'
		}]
	},
	password: {
		rules: [{
			required: true,
			errorMessage: '请输入密码'
		}, {
			minLength: 6,
			maxLength: 20,
			errorMessage: '密码长度应在6-20个字符之间'
		}]
	}
}

// 处理登录
const handleLogin = async () => {
	try {
		// 表单验证
		const valid = await form.value.validate()
		if (!valid) return
		
		// 调用登录接口
		const result = await userStore.login(formData)
		if (result) {
			uni.showToast({
				title: '登录成功',
				icon: 'success'
			})
			
			// 跳转到首页
			setTimeout(() => {
				uni.reLaunch({
					url: '/pages/index/index'
				})
			}, 1500)
		}
	} catch (error) {
		uni.showToast({
			title: error.message || '登录失败',
			icon: 'none'
		})
	}
}

// 跳转到注册页面
const goToRegister = () => {
	uni.navigateTo({
		url: '/pages/register/register'
	})
}
</script>

<style lang="scss">
.login-container {
	min-height: 100vh;
	background-color: #f5f5f5;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 40rpx;
	box-sizing: border-box;
	
	.login-box {
		width: 100%;
		max-width: 750rpx;
		background-color: #fff;
		border-radius: 20rpx;
		padding: 60rpx 40rpx;
		box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
		
		.title {
			font-size: 48rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 60rpx;
			text-align: center;
		}
		
		.form {
			:deep(.uni-forms-item) {
				margin-bottom: 40rpx;
				
				.uni-forms-item__inner {
					padding: 0;
				}
				
				.uni-forms-item__content {
					min-height: 80rpx;
				}
				
				.uni-easyinput {
					width: 100%;
					
					.uni-easyinput__content {
						height: 80rpx;
						border: 1rpx solid #ddd;
						border-radius: 8rpx;
						transition: border-color 0.3s ease;
						background-color: #fff;
						padding: 0 24rpx;
						
						&:focus-within {
							border-color: #2979ff;
						}
						
						.uni-easyinput__content-input {
							font-size: 30rpx;
							color: #333;
							height: 80rpx;
							line-height: 80rpx;
						}
						
						.content-clear-icon {
							margin-right: 10rpx;
						}
					}
				}
			}
			
			.login-btn {
				width: 100%;
				height: 80rpx;
				line-height: 80rpx;
				background: #2979ff;
				color: #fff;
				font-size: 32rpx;
				border-radius: 8rpx;
				margin-top: 60rpx;
				transition: opacity 0.3s ease;
				
				&:active {
					opacity: 0.8;
				}
				
				&::after {
					border: none;
				}
			}
			
			.register-link {
				text-align: center;
				margin-top: 40rpx;
				font-size: 28rpx;
				color: #666;
				
				text {
					color: #2979ff;
					margin-left: 10rpx;
					
					&:active {
						opacity: 0.8;
					}
				}
			}
		}
	}
}

// 暗黑模式支持
@media (prefers-color-scheme: dark) {
	.login-container {
		background-color: #1a1a1a;
		
		.login-box {
			background-color: #2c2c2c;
			box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.2);
			
			.title {
				color: #fff;
			}
			
			.form {
				:deep(.uni-forms-item) {
					.uni-easyinput {
						.uni-easyinput__content {
							background-color: #1a1a1a;
							border-color: #333;
							
							.uni-easyinput__content-input {
								color: #fff;
							}
							
							&:focus-within {
								border-color: #2979ff;
							}
						}
					}
				}
				
				.register-link {
					color: #999;
				}
			}
		}
	}
}
</style> 