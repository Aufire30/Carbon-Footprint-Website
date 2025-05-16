// 当DOM完全加载后执行脚本
document.addEventListener('DOMContentLoaded', function() {
    // 获取页面中的DOM元素
    const carbonForm = document.getElementById('carbon-form'); // 表单元素
    const resultSection = document.getElementById('result-section'); // 结果区域
    const carbonResult = document.getElementById('carbon-result'); // 碳足迹结果数值
    const resultBar = document.getElementById('result-bar'); // 进度条
    const resultComparison = document.getElementById('result-comparison'); // 比较文本
    const suggestionList = document.getElementById('suggestion-list'); // 建议列表
    
    // 定义全球和中国的平均碳足迹基准值（吨CO2/年）
    const globalAverage = 4.8; // 全球平均碳足迹
    const chinaAverage = 7.4; // 中国平均碳足迹
    
    // 定义各种活动的碳排放系数
    const defaultCarbonFactors = {
        car: 0.12,           // 每公里汽车排放kg CO2
        publicTransport: 0.04, // 每公里公共交通排放kg CO2
        electricity: 0.5,    // 每度电排放kg CO2
        meatConsumption: [0, 0.5, 1.0, 1.5], // 不同肉类消费水平的年吨CO2排放
        localFood: [0.8, 0.6, 0.4, 0.2]      // 不同本地食品比例的调整系数
    };
    
    // 定义碳足迹等级
    const carbonLevels = [
        { level: "优秀", threshold: globalAverage * 0.5, color: "#27ae60", description: "低于全球平均值50%" }, // 绿色
        { level: "良好", threshold: globalAverage, color: "#3498db", description: "全球平均值" },       // 蓝色
        { level: "一般", threshold: globalAverage * 1.5, color: "#f39c12", description: "高于全球平均值50%" }, // 黄色
        { level: "较高", threshold: globalAverage * 2, color: "#e74c3c", description: "高于全球平均值100%" },   // 红色
        { level: "过高", threshold: Infinity, color: "#9b59b6", description: "高于全球平均值100%以上" }             // 紫色
    ];
    
    // 定义减少碳足迹的建议列表
    const suggestions = {
        transport: [
            "尽可能选择步行、骑自行车或使用公共交通工具",
            "考虑购买电动或混合动力汽车",
            "与同事或朋友拼车出行"
        ],
        energy: [
            "使用节能灯具和电器",
            "不使用电器时关闭电源，避免待机能耗",
            "适当调整空调温度，夏季不低于26℃，冬季不高于20℃",
            "考虑安装太阳能等可再生能源设备"
        ],
        food: [
            "减少肉类消费，增加植物性食品的比例",
            "选择当季和本地生产的食品",
            "减少食物浪费，合理规划购买量",
            "自己烹饪食物，减少外卖和加工食品的消费"
        ]
    };
    
    // 为表单添加提交事件监听器
    carbonForm.addEventListener('submit', function(e) {
        e.preventDefault(); // 阻止表单默认提交行为
        
        // 获取用户输入的表单数据并转换为数值
        const carDistance = parseFloat(document.getElementById('car-distance').value) || 0;
        const publicTransport = parseFloat(document.getElementById('public-transport').value) || 0;
        const electricity = parseFloat(document.getElementById('electricity').value) || 0;
        const meatConsumption = parseInt(document.getElementById('meat-consumption').value);
        const localFood = parseInt(document.getElementById('local-food').value);
        
        // 获取用户自定义的碳排放因子参数
        const carbonFactors = {
            car: parseFloat(document.getElementById('car-factor').value) || defaultCarbonFactors.car,
            publicTransport: parseFloat(document.getElementById('public-transport-factor').value) || defaultCarbonFactors.publicTransport,
            electricity: parseFloat(document.getElementById('electricity-factor').value) || defaultCarbonFactors.electricity,
            meatConsumption: defaultCarbonFactors.meatConsumption,
            localFood: defaultCarbonFactors.localFood
        };
        
        // 计算交通相关的碳排放（吨CO2/年）
        // 将每周数据乘以52转换为年度数据，并除以1000将kg转换为吨
        const transportEmissions = 
            (carDistance * carbonFactors.car * 52 + 
             publicTransport * carbonFactors.publicTransport * 52) / 1000;
        
        // 计算能源相关的碳排放（吨CO2/年）
        // 将月度数据乘以12转换为年度数据，并除以1000将kg转换为吨
        const energyEmissions = 
            (electricity * carbonFactors.electricity * 12) / 1000;
        
        // 计算食品相关的碳排放（吨CO2/年）
        // 根据肉类消费水平和本地食品比例计算
        const foodEmissions = 
            carbonFactors.meatConsumption[meatConsumption] * 
            carbonFactors.localFood[localFood];
        
        // 计算总碳足迹（吨CO2/年）
        const totalEmissions = transportEmissions + energyEmissions + foodEmissions;
        
        // 更新结果显示，保留两位小数
        carbonResult.textContent = totalEmissions.toFixed(2);
        
        // 设置进度条宽度，相对于全球平均值的百分比，最高200%
        const percentage = Math.min((totalEmissions / globalAverage) * 100, 200);
        resultBar.style.width = `${percentage}%`;
        
        // 获取碳足迹等级
        const carbonLevel = getCarbonLevel(totalEmissions);
        
        // 计算碳足迹占全球平均值的百分比
        const percentOfGlobal = (totalEmissions / globalAverage * 100).toFixed(0);
        const compareText = totalEmissions < globalAverage ? 
            `低于全球平均值${(100 - percentOfGlobal).toFixed(0)}%` : 
            `高于全球平均值${(percentOfGlobal - 100).toFixed(0)}%`;
        
        // 根据等级设置进度条颜色
        resultBar.className = 'progress-bar';
        resultBar.style.backgroundColor = carbonLevel.color;
        
        // 更新比较结果文本，添加用户名称、学号、碳足迹等级和百分比
        resultComparison.innerHTML = `您的年碳足迹为 <strong>${totalEmissions.toFixed(2)}</strong> 吨CO₂，
            <span style="color:${carbonLevel.color};font-weight:bold;">等级：${carbonLevel.level}（${compareText}）</span>，
            全球平均水平为 <strong>${globalAverage}</strong> 吨，
            中国平均水平为 <strong>${chinaAverage}</strong> 吨。`;
        
        // 根据用户输入生成个性化建议
        generateSuggestions(carDistance, publicTransport, electricity, 
                           meatConsumption, localFood);
        
        // 显示结果区域（移除d-none类）
        resultSection.classList.remove('d-none');
        
        // 平滑滚动到结果区域
        resultSection.scrollIntoView({ behavior: 'smooth' });
    });
    
    // 根据碳足迹值获取对应等级
    function getCarbonLevel(emissions) {
        for (const level of carbonLevels) {
            if (emissions < level.threshold) {
                return level;
            }
        }
        return carbonLevels[carbonLevels.length - 1]; // 返回最高等级
    }
    
    // 生成个性化建议的函数
    function generateSuggestions(car, publicTransport, electricity, meat, localFood) {
        // 清空现有建议
        suggestionList.innerHTML = '';
        
        // 添加交通相关建议
        if (car > 50) {
            addSuggestion(suggestions.transport[0]);
            addSuggestion(suggestions.transport[2]);
        }
        if (car > 100) {
            addSuggestion(suggestions.transport[1]);
        }
        
        // 添加能源相关建议
        if (electricity > 200) {
            addSuggestion(suggestions.energy[0]);
            addSuggestion(suggestions.energy[1]);
        }
        if (electricity > 300) {
            addSuggestion(suggestions.energy[2]);
        }
        if (electricity > 400) {
            addSuggestion(suggestions.energy[3]);
        }
        
        // 添加食品相关建议
        if (meat > 1) {
            addSuggestion(suggestions.food[0]);
        }
        if (localFood < 2) {
            addSuggestion(suggestions.food[1]);
        }
        addSuggestion(suggestions.food[2]); // 这条建议对所有人都有用
        
        // 如果没有添加任何建议，添加一条通用建议
        if (suggestionList.children.length === 0) {
            addSuggestion("您的碳足迹已经很低了！继续保持环保生活方式。");
        }
    }
    
    // 辅助函数：添加建议到列表
    function addSuggestion(text) {
        const li = document.createElement('li');
        li.textContent = text;
        li.className = 'mb-2';
        suggestionList.appendChild(li);
    }
});