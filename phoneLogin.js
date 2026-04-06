import { execSync } from "child_process";
import { printBlue, printGreen, printRed, printYellow } from "./utils/colorOut.js";
import { close_api, delay, send, startService } from "./utils/utils.js";

async function login() {

  const phone = process.env.PHONE
  const code = process.env.CODE
  const PAT = process.env.PAT
  const USERINFO = process.env.USERINFO
  const APPEND_USER = process.env.APPEND_USER
  const userinfo = (USERINFO && APPEND_USER == "是") ? JSON.parse(USERINFO) : []

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

      let userAlreadyExist = false
      printGreen("登录成功！")
      if (PAT) {
        if (APPEND_USER == "是") {
          for (let i = 0; i < userinfo.length; i++) {

            if (userinfo[i].userid == res.data.userid) {
              userAlreadyExist = true
              printYellow(`userid: ${userinfo[i].userid} 此账号已存在, 仅更新登录信息`)
              userinfo[i].token = res.data.token
            }
          }
        }
        if (!userAlreadyExist) {
          userinfo.push({
            userid: res.data.userid,
            token: res.data.token
          })
        }
        if (userinfo.length) {
          const userinfoJSON = JSON.stringify(userinfo)
          if (PAT) {
            try {
              execSync(`gh secret set USERINFO -b'${userinfoJSON}' --repo ${process.env.GITHUB_REPOSITORY}`);
              printGreen("secret <USERINFO> 更改成功")
            } catch (error) {
              printRed("自动写入出错，登录信息如下，请手动添加到secret USERINFO")
              printRed(userinfoJSON)
            }
          } else {
            printGreen("登录信息如下，把它添加到secret USERINFO 即可")
            printBlue(userinfoJSON)
          }
        }
      } else {
        printRed("PAT变量缺失")
      }
    } else if (result.error_code === 34175) {
      throw new Error("暂不支持多账号绑定手机登录")
    } else {
      printRed("响应内容")
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