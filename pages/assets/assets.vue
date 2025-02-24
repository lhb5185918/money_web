<template>
	<view class="container">
		<!-- 资产分类标签页 -->
		<uni-segmented-control
			:current="currentTab"
			:values="['现金账户', '投资理财', '固定资产']"
			@clickItem="onTabChange"
			styleType="button"
			activeColor="#007AFF"
		/>
		
		<!-- 现金账户列表 -->
		<view v-show="currentTab === 0" class="tab-content">
			<uni-list>
				<uni-list-item v-for="(account, index) in cashAccounts" :key="index"
					:title="account.name"
					:note="account.type"
					:rightText="'￥' + account.balance.toFixed(2)"
					:showExtraIcon="true"
					:extraIcon="{ type: 'wallet-filled', color: '#007AFF', size: 24 }"
					@click="handleAccountClick(account)"
				/>
			</uni-list>
		</view>
		
		<!-- 投资理财列表 -->
		<view v-show="currentTab === 1" class="tab-content">
			<uni-list>
				<uni-list-item v-for="(investment, index) in investments" :key="index"
					:title="investment.name"
					:note="investment.type"
					:rightText="'￥' + investment.amount.toFixed(2)"
					:showExtraIcon="true"
					:extraIcon="{ type: 'chart', color: '#36B37E', size: 24 }"
					@click="handleInvestmentClick(investment)"
				>
					<template v-slot:footer>
						<view class="rate-wrapper">
							<uni-icons :type="investment.rate >= 0 ? 'arrow-up' : 'arrow-down'"
								:color="investment.rate >= 0 ? '#07c160' : '#ff4d4f'"
								size="14"
							></uni-icons>
							<text :class="['rate', investment.rate >= 0 ? 'positive' : 'negative']">
								{{ (investment.rate > 0 ? '+' : '') + investment.rate.toFixed(2) }}%
							</text>
						</view>
					</template>
				</uni-list-item>
			</uni-list>
		</view>
		
		<!-- 固定资产列表 -->
		<view v-show="currentTab === 2" class="tab-content">
			<uni-list>
				<uni-list-item v-for="(asset, index) in fixedAssets" :key="index"
					:title="asset.name"
					:note="'购入日期：' + asset.purchaseDate"
					:rightText="'￥' + asset.value.toFixed(2)"
					:showExtraIcon="true"
					:extraIcon="{ type: 'home', color: '#ff4d4f', size: 24 }"
					@click="handleAssetClick(asset)"
				/>
			</uni-list>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'

const currentTab = ref(0)

// 示例数据
const cashAccounts = ref([
	{ name: '工商银行', type: '储蓄卡', balance: 50000 },
	{ name: '支付宝', type: '电子钱包', balance: 15000 },
	{ name: '微信钱包', type: '电子钱包', balance: 8000 }
])

const investments = ref([
	{ name: '股票账户', type: '股票', amount: 60000, rate: 8.5 },
	{ name: '基金组合', type: '基金', amount: 30000, rate: 5.2 },
	{ name: '定期存款', type: '存款', amount: 100000, rate: 2.8 }
])

const fixedAssets = ref([
	{ name: '房产', type: '不动产', value: 2000000, purchaseDate: '2020-01-01' },
	{ name: '汽车', type: '交通工具', value: 150000, purchaseDate: '2022-06-15' }
])

const onTabChange = (e) => {
	currentTab.value = e.currentIndex
}

const handleAccountClick = (account) => {
	uni.navigateTo({
		url: `/pages/assets/detail?type=cash&id=${account.id}`
	})
}

const handleInvestmentClick = (investment) => {
	uni.navigateTo({
		url: `/pages/assets/detail?type=investment&id=${investment.id}`
	})
}

const handleAssetClick = (asset) => {
	uni.navigateTo({
		url: `/pages/assets/detail?type=fixed&id=${asset.id}`
	})
}
</script>

<style lang="scss">
.container {
	padding: 15px;
	
	.tab-content {
		margin-top: 15px;
	}
	
	:deep(.uni-segmented-control) {
		margin-bottom: 15px;
	}
	
	:deep(.uni-list-item) {
		margin-bottom: 10px;
		border-radius: 8px;
		background-color: #fff;
		
		.uni-list-item__container {
			padding: 15px;
		}
		
		.uni-list-item__content-title {
			font-size: 16px;
			font-weight: 500;
			color: #333;
		}
		
		.uni-list-item__content-note {
			font-size: 12px;
			color: #999;
			margin-top: 4px;
		}
		
		.uni-list-item__extra-text {
			font-size: 16px;
			font-weight: bold;
			color: #333;
		}
	}
	
	.rate-wrapper {
		display: flex;
		align-items: center;
		margin-top: 4px;
		
		.rate {
			font-size: 14px;
			margin-left: 4px;
			
			&.positive {
				color: #07c160;
			}
			
			&.negative {
				color: #ff4d4f;
			}
		}
	}
}
</style> 