// 上下學期各自持有課次、題庫與本機紀錄；六上舊題目ID保持相容。
window.CURRICULA = {
  upper: {
    id:'upper',label:'六上',term:'六年級上學期',lessons:window.LESSONS,
    extra:window.EXTRA.map((item,i)=>({...item,...window.UPPER_EXTENSIONS[i]})),
    presets:{all:{label:'全冊 1–12 課',ids:[1,2,3,4,5,6,7,8,9,10,11,12]},mid:{label:'期中 1–6 課',ids:[1,2,3,4,5,6]},final:{label:'期末 7–12 課',ids:[7,8,9,10,11,12]}}
  },
  lower: {
    id:'lower',label:'六下',term:'六年級下學期',lessons:window.LOWER_LESSONS,extra:window.LOWER_EXTRA,
    presets:{all:{label:'全冊 1–9 課',ids:[1,2,3,4,5,6,7,8,9]},mid:{label:'前段 1–4 課',ids:[1,2,3,4]},final:{label:'後段 5–9 課',ids:[5,6,7,8,9]}}
  }
};
