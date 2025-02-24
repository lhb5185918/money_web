<template>
	<view class="container">
		<!-- 账户列表 -->
		<view class="account-list">
			<view class="account-item" v-for="account in accounts" :key="account.id">
				<view class="account-content" @click="handleEdit(account)">
					<view class="account-info">
						<text class="account-name">{{account.name}}</text>
						<text class="account-type">{{account.type}}</text>
					</view>
					<view class="account-balance">
						<text class="balance-label">余额</text>
						<text class="balance-amount">{{account.balance}}</text>
					</view>
				</view>
				<view class="account-actions">
					<button class="action-btn delete" @click="handleDelete(account)">删除</button>
				</view>
			</view>
		</view>
		
		<!-- 添加账户按钮 -->
		<view class="add-btn" @click="showAccountModal('add')">
			<text class="iconfont icon-add"></text>
			<text>添加账户</text>
		</view>
		
		<!-- 账户表单弹窗 -->
		<uni-popup ref="popup" type="center">
			<view class="modal-content">
				<view class="modal-header">
					<text class="modal-title">{{isEdit ? '编辑账户' : '添加账户'}}</text>
					<text class="close-btn" @click="hideAccountModal">×</text>
				</view>
				
				<view class="modal-body">
					<uni-forms ref="form" :modelValue="formData" :rules="rules">
						<uni-forms-item name="name">
							<uni-easyinput
								v-model="formData.name"
								placeholder="请输入账户名称"
							/>
						</uni-forms-item>
						
						<uni-forms-item name="type">
							<uni-data-select
								v-model="formData.type"
								:localdata="accountTypes"
								placeholder="请选择账户类型"
							/>
						</uni-forms-item>
						
						<uni-forms-item name="balance">
							<uni-easyinput
								v-model="formData.balance"
								type="number"
								placeholder="请输入账户余额"
							/>
						</uni-forms-item>
					</uni-forms>
				</view>
				
				<view class="modal-footer">
					<button class="cancel-btn" @click="hideAccountModal">取消</button>
					<button class="confirm-btn" type="primary" @click="handleSubmit">确定</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

// 数据
const accounts = ref([
	{ id: 1, name: '现金账户', balance: '28,500.00', type: 'cash' },
	{ id: 2, name: '工商银行', balance: '50,000.00', type: 'bank' },
	{ id: 3, name: '支付宝', balance: '30,000.00', type: 'alipay' },
	{ id: 4, name: '微信钱包', balance: '20,000.00', type: 'wechat' }
])
const popup = ref(null)
const form = ref(null)
const isEdit = ref(false)
const currentAccount = ref(null)

const formData = reactive({
	name: '',
	type: '',
	balance: ''
})

const accountTypes = [
	{ value: 'cash', text: '现金' },
	{ value: 'bank', text: '银行卡' },
	{ value: 'alipay', text: '支付宝' },
	{ value: 'wechat', text: '微信' }
]

const rules = {
	name: {
		rules: [{
			required: true,
			errorMessage: '请输入账户名称'
		}]
	},
	type: {
		rules: [{
			required: true,
			errorMessage: '请选择账户类型'
		}]
	},
	balance: {
		rules: [{
			required: true,
			errorMessage: '请输入账户余额'
		}]
	}
}

// 显示账户弹窗
const showAccountModal = (type, account = null) => {
	isEdit.value = type === 'edit'
	if (isEdit.value && account) {
		currentAccount.value = account
		formData.name = account.name
		formData.type = account.type
		formData.balance = account.balance
	} else {
		currentAccount.value = null
		formData.name = ''
		formData.type = ''
		formData.balance = ''
	}
	popup.value.open()
}

// 隐藏账户弹窗
const hideAccountModal = () => {
	popup.value.close()
}

// 处理表单提交
const handleSubmit = async () => {
	try {
		const valid = await form.value.validate()
		if (valid) {
			if (isEdit.value) {
				// 模拟编辑账户
				const index = accounts.value.findIndex(item => item.id === currentAccount.value.id)
				if (index !== -1) {
					accounts.value[index] = {
						...accounts.value[index],
						name: formData.name,
						type: formData.type,
						balance: formData.balance
					}
				}
				uni.showToast({
					title: '更新成功',
					icon: 'success'
				})
			} else {
				// 模拟添加账户
				accounts.value.push({
					id: Date.now(),
					name: formData.name,
					type: formData.type,
					balance: formData.balance
				})
				uni.showToast({
					title: '添加成功',
					icon: 'success'
				})
			}
			
			hideAccountModal()
		}
	} catch (error) {
		uni.showToast({
			title: error.message || '操作失败',
			icon: 'none'
		})
	}
}

// 编辑账户
const handleEdit = (account) => {
	showAccountModal('edit', account)
}

// 删除账户
const handleDelete = async (account) => {
	try {
		await uni.showModal({
			title: '提示',
			content: '确定要删除该账户吗？',
			success: (res) => {
				if (res.confirm) {
					// 模拟删除账户
					const index = accounts.value.findIndex(item => item.id === account.id)
					if (index !== -1) {
						accounts.value.splice(index, 1)
					}
					uni.showToast({
						title: '删除成功',
						icon: 'success'
					})
				}
			}
		})
	} catch (error) {
		uni.showToast({
			title: '删除失败',
			icon: 'none'
		})
	}
}

// 初始化
onMounted(() => {
	// 使用模拟数据,暂时不调用API
})
</script>

<style lang="scss">
.container {
	min-height: 100vh;
	background-color: #f5f5f5;
	padding: 15px;
	padding-bottom: 100px;
}

.account-list {
	.account-item {
		background-color: #fff;
		border-radius: 8px;
		margin-bottom: 15px;
		overflow: hidden;
		
		.account-content {
			padding: 20px;
			
			.account-info {
				display: flex;
				align-items: center;
				margin-bottom: 10px;
				
				.account-name {
					font-size: 18px;
					font-weight: bold;
					color: #333;
				}
				
				.account-type {
					font-size: 14px;
					color: #666;
					margin-left: 10px;
					padding: 2px 8px;
					background-color: #f5f5f5;
					border-radius: 4px;
				}
			}
			
			.account-balance {
				.balance-label {
					font-size: 14px;
					color: #999;
					margin-right: 10px;
				}
				
				.balance-amount {
					font-size: 20px;
					color: #333;
					font-weight: bold;
				}
			}
		}
		
		.account-actions {
			display: flex;
			border-top: 1px solid #f5f5f5;
			
			.action-btn {
				flex: 1;
				height: 44px;
				line-height: 44px;
				text-align: center;
				font-size: 16px;
				background: none;
				border: none;
				border-radius: 0;
				
				&.delete {
					color: #ff4d4f;
				}
				
				&::after {
					border: none;
				}
			}
		}
	}
}

.add-btn {
	position: fixed;
	bottom: 30px;
	left: 50%;
	transform: translateX(-50%);
	background-color: #2979ff;
	color: #fff;
	height: 44px;
	line-height: 44px;
	padding: 0 30px;
	border-radius: 22px;
	display: flex;
	align-items: center;
	box-shadow: 0 4px 12px rgba(41, 121, 255, 0.4);
	
	.iconfont {
		font-size: 20px;
		margin-right: 5px;
	}
	
	text {
		font-size: 16px;
	}
}

.modal-content {
	background-color: #fff;
	border-radius: 8px;
	width: 300px;
	
	.modal-header {
		padding: 15px;
		border-bottom: 1px solid #f5f5f5;
		display: flex;
		justify-content: space-between;
		align-items: center;
		
		.modal-title {
			font-size: 18px;
			font-weight: bold;
			color: #333;
		}
		
		.close-btn {
			font-size: 24px;
			color: #999;
			padding: 0 10px;
		}
	}
	
	.modal-body {
		padding: 15px;
	}
	
	.modal-footer {
		padding: 15px;
		border-top: 1px solid #f5f5f5;
		display: flex;
		justify-content: flex-end;
		
		button {
			margin-left: 10px;
			
			&.cancel-btn {
				background: none;
				border: 1px solid #ddd;
				color: #666;
			}
			
			&::after {
				border: none;
			}
		}
	}
}
</style> 