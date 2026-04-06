import { close_api, delay, send, startService } from "./utils/utils.js";

async function login() {

  const phone = process.env.PHONE
  const code = process.env.CODE

  // 不使用二维码登录并且没有手机号或验证码
  if (!phone || !code) {
    throw new Error("未配置")
  }
  // 启动服务
  const api = startService()
  await delay(2000)

  try {
    // 手机号登录请求
    const result = await send(`/login/cellphone?mobile=${phone}&code=${code}`, "GET", {})
    if (result.status === 1) {
      console.log("登录成功！")
      console.log("第一行是token,第二行是userid")
      console.log(result.data.token)
      console.log(result.data.userid)
    } else if (result.error_code === 34175) {
      throw new Error("暂不支持多账号绑定手机登录")
    } else {
      console.log("响应内容")
      console.dir(result, { depth: null })
      throw new Error("登录失败！请检查")
    }
  } finally {
    close_api(api)
  }

  if (api.killed) {
    process.exit(0)
  }
}

login()
