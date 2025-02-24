<template>
	<view class="record-container">
		<view class="record-form">
			<uni-forms ref="form" :modelValue="formData" :rules="rules">
				<uni-forms-item name="type">
					<uni-segmented-control 
						:current="formData.type" 
						:values="['支出', '收入']"
						@clickItem="handleTypeChange"
					/>
				</uni-forms-item>
				
				<uni-forms-item name="amount">
					<uni-easyinput
						v-model="formData.amount"
						type="number"
						placeholder="请输入金额"
					/>
				</uni-forms-item>
				
				<uni-forms-item name="category_id">
					<view class="select-input" @click="showCategoryPicker">
						<text class="select-value">{{formData.category_id ? categories.find(item => item.value === formData.category_id)?.text : '请选择分类'}}</text>
						<text class="select-arrow iconfont icon-arrow-down"></text>
					</view>
				</uni-forms-item>
				
				<uni-forms-item name="account_id">
					<view class="select-input" @click="showAccountPicker">
						<text class="select-value">{{formData.account_id ? accounts.find(item => item.id === formData.account_id)?.name : '请选择账户'}}</text>
						<text class="select-arrow iconfont icon-arrow-down"></text>
					</view>
				</uni-forms-item>
				
				<uni-forms-item name="date">
					<uni-datetime-picker
						v-model="formData.date"
						type="date"
						:clear-icon="false"
					/>
				</uni-forms-item>
			</uni-forms>
			
			<button class="save-btn" @click="handleSubmit">保存</button>
		</view>
		
		<!-- 分类选择弹窗 -->
		<uni-popup ref="categoryPicker" type="bottom" background-color="none" safe-area>
			<view class="picker-popup">
				<view class="picker-header">
					<text class="picker-title">选择分类</text>
					<text class="close-btn iconfont icon-close" @click="hideCategoryPicker">×</text>
				</view>
				<view class="picker-body">
					<view 
						v-for="item in categories" 
						:key="item.value"
						class="picker-item"
						:class="{ active: formData.category_id === item.value }"
						@click="handleCategorySelect(item)"
					>
						<text>{{item.text}}</text>
						<text class="iconfont icon-check" v-if="formData.category_id === item.value">✓</text>
					</view>
				</view>
			</view>
		</uni-popup>

		<!-- 账户选择弹窗 -->
		<uni-popup ref="accountPicker" type="bottom" background-color="none" safe-area>
			<view class="picker-popup">
				<view class="picker-header">
					<text class="picker-title">选择账户</text>
					<text class="close-btn iconfont icon-close" @click="hideAccountPicker">×</text>
				</view>
				<view class="picker-body">
					<view 
						v-for="item in accounts" 
						:key="item.id"
						class="picker-item"
						:class="{ active: formData.account_id === item.id }"
						@click="handleAccountSelect(item)"
					>
						<text>{{item.name}}</text>
						<text class="iconfont icon-check" v-if="formData.account_id === item.id">✓</text>
					</view>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import request from '@/utils/request'

// 表单数据
const form = ref(null)
const formData = reactive({
	type: 0,
	amount: '',
	category_id: '',
	account_id: '',
	date: new Date().toISOString().split('T')[0]
})

// 分类选项
const categories = ref([
	{ value: 1, text: '工资收入' },
	{ value: 2, text: '购物支出' },
	{ value: 3, text: '理财收益' },
	{ value: 4, text: '日常开销' },
	{ value: 5, text: '交通出行' },
	{ value: 6, text: '餐饮美食' }
])

// 账户选项
const accounts = ref([
	{ id: 1, name: '现金账户', balance: '28,500.00', type: '现金' },
	{ id: 2, name: '工商银行', balance: '50,000.00', type: '银行卡' },
	{ id: 3, name: '支付宝', balance: '30,000.00', type: '支付宝' },
	{ id: 4, name: '微信钱包', balance: '20,000.00', type: '微信' }
])

// 表单验证规则
const rules = {
	amount: {
		rules: [{
			required: true,
			errorMessage: '请输入金额'
		}]
	},
	category_id: {
		rules: [{
			required: true,
			errorMessage: '请选择分类'
		}]
	},
	account_id: {
		rules: [{
			required: true,
			errorMessage: '请选择账户'
		}]
	}
}

// 处理类型切换
const handleTypeChange = (e) => {
	formData.type = e.currentIndex
}

// 处理表单提交
const handleSubmit = async () => {
	try {
		// 表单验证
		const valid = await form.value.validate()
		if (!valid) return
		
		// 发送记账请求
		const result = await request.post('/api/transactions', {
			type: formData.type,
			amount: parseFloat(formData.amount),
			category_id: formData.category_id,
			account_id: formData.account_id,
			date: formData.date
		})
		
		if (result.data) {
			uni.showToast({
				title: '记账成功',
				icon: 'success'
			})
			
			// 返回上一页并刷新数据
			setTimeout(() => {
				const pages = getCurrentPages()
				const prevPage = pages[pages.length - 2]
				
				// 触发上一页的刷新方法
				if (prevPage && prevPage.$vm) {
					prevPage.$vm.refreshData && prevPage.$vm.refreshData()
				}
				
				uni.navigateBack()
			}, 1500)
		}
	} catch (error) {
		uni.showToast({
			title: error.message || '操作失败',
			icon: 'none'
		})
	}
}

// 选择器引用
const categoryPicker = ref(null)
const accountPicker = ref(null)

// 显示/隐藏分类选择器
const showCategoryPicker = () => {
	categoryPicker.value.open()
}

const hideCategoryPicker = () => {
	categoryPicker.value.close()
}

// 显示/隐藏账户选择器
const showAccountPicker = () => {
	accountPicker.value.open()
}

const hideAccountPicker = () => {
	accountPicker.value.close()
}

// 处理分类选择
const handleCategorySelect = (item) => {
	formData.category_id = item.value
	hideCategoryPicker()
}

// 处理账户选择
const handleAccountSelect = (item) => {
	formData.account_id = item.id
	hideAccountPicker()
}
</script>

<style lang="scss">
.record-container {
	min-height: 100vh;
	background-color: #f5f5f5;
	padding: 30rpx;
	
	.record-form {
		background-color: #fff;
		border-radius: 20rpx;
		padding: 40rpx 30rpx;
		box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
		
		:deep(.uni-forms-item) {
			margin-bottom: 40rpx;
			
			.uni-forms-item__inner {
				padding: 0;
			}
			
			.uni-forms-item__content {
				min-height: 80rpx;
			}
		}
		
		.select-input {
			height: 80rpx;
			border: 1rpx solid #ddd;
			border-radius: 8rpx;
			padding: 0 24rpx;
			background-color: #fff;
			display: flex;
			align-items: center;
			justify-content: space-between;
			transition: all 0.3s ease;
			
			&:active {
				background-color: #f5f5f5;
			}
			
			.select-value {
				font-size: 30rpx;
				color: #333;
			}
			
			.select-arrow {
				color: #999;
				font-size: 24rpx;
				transition: transform 0.3s ease;
			}
		}
		
		:deep(.uni-easyinput__content) {
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
		
		.save-btn {
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
	}
}

.picker-popup {
	background-color: #fff;
	border-radius: 20rpx 20rpx 0 0;
	overflow: hidden;
	
	.picker-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx;
		border-bottom: 1rpx solid #f5f5f5;
		
		.picker-title {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
		}
		
		.close-btn {
			padding: 10rpx;
			color: #999;
			font-size: 40rpx;
			
			&:active {
				opacity: 0.7;
			}
		}
	}
	
	.picker-body {
		max-height: 60vh;
		overflow-y: auto;
		
		.picker-item {
			padding: 30rpx;
			font-size: 30rpx;
			color: #333;
			display: flex;
			align-items: center;
			justify-content: space-between;
			border-bottom: 1rpx solid #f5f5f5;
			
			&:active {
				background-color: #f5f5f5;
			}
			
			&.active {
				color: #2979ff;
				
				.iconfont {
					color: #2979ff;
					visibility: visible;
				}
			}
			
			.iconfont {
				visibility: hidden;
				font-size: 40rpx;
			}
		}
	}
}

// 暗黑模式支持
@media (prefers-color-scheme: dark) {
	.record-container {
		background-color: #1a1a1a;
		
		.record-form {
			background-color: #2c2c2c;
			box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.2);
			
			.select-input {
				background-color: #1a1a1a;
				border-color: #333;
				
				.select-value {
					color: #fff;
				}
				
				.select-arrow {
					color: #666;
				}
				
				&:active {
					background-color: #333;
				}
			}
			
			:deep(.uni-easyinput__content) {
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
	
	.picker-popup {
		background-color: #2c2c2c;
		
		.picker-header {
			border-bottom-color: #333;
			
			.picker-title {
				color: #fff;
			}
			
			.close-btn {
				color: #666;
			}
		}
		
		.picker-body {
			.picker-item {
				color: #fff;
				border-bottom-color: #333;
				
				&:active {
					background-color: #333;
				}
			}
		}
	}
}
</style> 