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
    const carbonFactors = {
        car: 0.12,           // 每公里汽车排放kg CO2
        publicTransport: 0.04, // 每公里公共交通排放kg CO2
        flight: 90,          // 每小时飞行排放kg CO2
        electricity: 0.5,    // 每度电排放kg CO2
        naturalGas: 2.0,     // 每立方米天然气排放kg CO2
        meatConsumption: [0, 0.5, 1.0, 1.5], // 不同肉类消费水平的年吨CO2排放
        localFood: [0.8, 0.6, 0.4, 0.2]      // 不同本地食品比例的调整系数
    };
    
    // 定义减少碳足迹的建议列表
    const suggestions = {
        car: "减少驾车出行，考虑步行、骑行或使用公共交通。",
        publicTransport: "尽可能选择低碳出行方式，如地铁、电动公交车。",
        flight: "减少不必要的飞行旅行，选择视频会议代替商务旅行。",
        electricity: "使用节能电器，不用时关闭电源，考虑使用可再生能源。",
        naturalGas: "改善家庭保温隔热，减少取暖和热水使用。",
        meat: "减少肉类消费，增加植物性食品在饮食中的比例。",
        localFood: "优先选择当地生产的季节性食品，减少食品运输产生的碳排放。",
        general: [
            "使用可重复使用的物品，减少一次性产品的使用。",
            "参与植树造林活动，增加碳汇。",
            "选择节能环保认证的产品和服务。",
            "减少食物浪费，合理规划购买和烹饪量。"
        ]
    };
    
    // 为表单添加提交事件监听器
    carbonForm.addEventListener('submit', function(e) {
        e.preventDefault(); // 阻止表单默认提交行为
        
        // 获取用户输入的表单数据并转换为数值
        const carDistance = parseFloat(document.getElementById('car-distance').value) || 0;
        const publicTransport = parseFloat(document.getElementById('public-transport').value) || 0;
        const flightHours = parseFloat(document.getElementById('flight-hours').value) || 0;
        const electricity = parseFloat(document.getElementById('electricity').value) || 0;
        const naturalGas = parseFloat(document.getElementById('natural-gas').value) || 0;
        const meatConsumption = parseInt(document.getElementById('meat-consumption').value);
        const localFood = parseInt(document.getElementById('local-food').value);
        
        // 计算交通相关的碳排放（吨CO2/年）
        // 将每周数据乘以52转换为年度数据，并除以1000将kg转换为吨
        const transportEmissions = 
            (carDistance * carbonFactors.car * 52 + 
             publicTransport * carbonFactors.publicTransport * 52 + 
             flightHours * carbonFactors.flight) / 1000;
        
        // 计算能源相关的碳排放（吨CO2/年）
        // 将月度数据乘以12转换为年度数据，并除以1000将kg转换为吨
        const energyEmissions = 
            (electricity * carbonFactors.electricity * 12 + 
             naturalGas * carbonFactors.naturalGas * 12) / 1000;
        
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
        
        // 根据排放量设置进度条颜色
        if (totalEmissions < globalAverage * 0.5) {
            resultBar.className = 'progress-bar bg-success'; // 绿色 - 很好
        } else if (totalEmissions < globalAverage) {
            resultBar.className = 'progress-bar bg-info'; // 蓝色 - 良好
        } else if (totalEmissions < globalAverage * 1.5) {
            resultBar.className = 'progress-bar bg-warning'; // 黄色 - 警告
        } else {
            resultBar.className = 'progress-bar bg-danger'; // 红色 - 危险
        }
        
        // 更新比较结果文本
        resultComparison.innerHTML = `您的年碳足迹为 <strong>${totalEmissions.toFixed(2)}</strong> 吨CO₂，
            全球平均水平为 <strong>${globalAverage}</strong> 吨，
            中国平均水平为 <strong>${chinaAverage}</strong> 吨。`;
        
        // 根据用户输入生成个性化建议
        generateSuggestions(carDistance, publicTransport, flightHours, 
                           electricity, naturalGas, meatConsumption, localFood);
        
        // 显示结果区域（移除d-none类）
        resultSection.classList.remove('d-none');
        
        // 平滑滚动到结果区域
        resultSection.scrollIntoView({ behavior: 'smooth' });
    });
    
    // 生成个性化建议的函数
    function generateSuggestions(car, publicTransport, flight, electricity, naturalGas, meat, localFood) {
        // 清空现有建议列表
        suggestionList.innerHTML = '';
        let suggestionsToShow = [];
        
        // 根据用户输入的数据添加相关建议
        if (car > 50) suggestionsToShow.push(suggestions.car); // 如果每周驾车超过50公里
        if (flight > 10) suggestionsToShow.push(suggestions.flight); // 如果年飞行时间超过10小时
        if (electricity > 300) suggestionsToShow.push(suggestions.electricity); // 如果月用电量超过300度
        if (naturalGas > 50) suggestionsToShow.push(suggestions.naturalGas); // 如果月天然气用量超过50立方米
        if (meat > 1) suggestionsToShow.push(suggestions.meat); // 如果肉类消费频率较高
        if (localFood < 2) suggestionsToShow.push(suggestions.localFood); // 如果本地食品比例较低
        
        // 添加一般性建议
        suggestionsToShow = suggestionsToShow.concat(suggestions.general);
        
        // 限制建议数量为6条，避免信息过载
        suggestionsToShow = suggestionsToShow.slice(0, 6);
        
        // 将建议添加到页面中
        suggestionsToShow.forEach(suggestion => {
            const li = document.createElement('li'); // 创建列表项
            li.textContent = suggestion; // 设置建议文本
            suggestionList.appendChild(li); // 添加到建议列表
        });
    }
});