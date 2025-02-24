<template>
	<view class="register-container">
		<view class="register-box">
			<view class="title">注册</view>
			<view class="form">
				<uni-forms ref="form" :modelValue="formData" :rules="rules">
					<uni-forms-item name="username">
						<uni-easyinput
							v-model="formData.username"
							placeholder="请输入用户名"
							:clearable="true"
						/>
					</uni-forms-item>
					
					<uni-forms-item name="password">
						<uni-easyinput
							v-model="formData.password"
							type="password"
							placeholder="请输入密码"
							:clearable="true"
						/>
					</uni-forms-item>
					
					<uni-forms-item name="confirmPassword">
						<uni-easyinput
							v-model="formData.confirmPassword"
							type="password"
							placeholder="请确认密码"
							:clearable="true"
						/>
					</uni-forms-item>
				</uni-forms>
				
				<button class="register-btn" @click="handleRegister">注册</button>
				
				<view class="login-link">
					已有账号？<text @click="goToLogin">立即登录</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 表单数据
const form = ref(null)
const formData = reactive({
	username: '',
	password: '',
	confirmPassword: '',
	role: 'user' // 默认用户角色
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
	},
	confirmPassword: {
		rules: [{
			required: true,
			errorMessage: '请确认密码'
		}, {
			validateFunction: (rule, value, data) => {
				return value === data.password
			},
			errorMessage: '两次输入的密码不一致'
		}]
	}
}

// 处理注册
const handleRegister = async () => {
	try {
		// 表单验证
		const valid = await form.value.validate()
		if (!valid) return
		
		// 调用注册接口
		const { confirmPassword, ...registerData } = formData
		await userStore.register(registerData)
		
		uni.showToast({
			title: '注册成功',
			icon: 'success'
		})
		
		// 跳转到登录页
		setTimeout(() => {
			uni.navigateBack()
		}, 1500)
	} catch (error) {
		uni.showToast({
			title: error.message || '注册失败',
			icon: 'none'
		})
	}
}

// 跳转到登录页
const goToLogin = () => {
	uni.navigateBack()
}
</script>

<style lang="scss">
.register-container {
	min-height: 100vh;
	background-color: #f5f5f5;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 40rpx;
	
	.register-box {
		width: 100%;
		background-color: #fff;
		border-radius: 20rpx;
		padding: 40rpx;
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
				
				.uni-easyinput__content {
					height: 80rpx;
					border: 1rpx solid #ddd;
					border-radius: 8rpx;
					transition: border-color 0.3s ease;
					background-color: #fff;
					
					&:focus-within {
						border-color: #2979ff;
					}
					
					.uni-easyinput__content-input {
						font-size: 30rpx;
						color: #333;
					}
				}
			}
			
			.register-btn {
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
			
			.login-link {
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
	.register-container {
		background-color: #1a1a1a;
		
		.register-box {
			background-color: #2c2c2c;
			box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.2);
			
			.title {
				color: #fff;
			}
			
			.form {
				:deep(.uni-forms-item) {
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
				
				.login-link {
					color: #999;
				}
			}
		}
	}
}
</style> 