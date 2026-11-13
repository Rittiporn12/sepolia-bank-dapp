<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&amp;color=0:08152e,55:1947a6,100:3985ed&amp;height=170&amp;section=header&amp;text=Sepolia%20Bank&amp;fontSize=48&amp;fontColor=ffffff&amp;fontAlignY=36" alt="Sepolia Bank" />

  <p>เว็บทดลองฝาก ถอน และตรวจสอบยอดเงินผ่าน Smart Contract บน Ethereum Sepolia</p>
  <p><strong>นายฤทธิพร ผึ่งผาย · รหัสนักศึกษา 66088346</strong></p>
  <p>
    <a href="https://rittiporn12.github.io/sepolia-bank-dapp/"><strong>เปิดเว็บ Sepolia Bank</strong></a>
    &nbsp;·&nbsp;
    <a href="https://sepolia.etherscan.io/address/0xC9557B2f87C9A85a5Aa74EB8963c69781dfF07b4">ดูสัญญาบน Etherscan</a>
  </p>
</div>

## วิธีใช้งาน

เตรียม MetaMask ที่เลือกเครือข่าย **Sepolia** และมี **Sepolia ETH** สำหรับทดลองฝากและจ่ายค่า gas จากนั้นเปิด [เว็บ Sepolia Bank](https://rittiporn12.github.io/sepolia-bank-dapp/)

1. **เชื่อมกระเป๋า** — กด **Connect MetaMask** แล้วเลือกบัญชีและยืนยันใน MetaMask เว็บตั้งที่อยู่สัญญา Bank ไว้ให้แล้ว
2. **เช็กยอด** — กด **Check Balance** การ์ดสีฟ้าจะแสดงยอดฝากในสัญญาของบัญชีที่เชื่อมอยู่
3. **ฝากเงิน** — พิมพ์จำนวนในช่อง **จำนวนเงิน** เช่น `0.001` แล้วกด **Deposit** และยืนยันใน MetaMask
4. **ถอนเงิน** — พิมพ์จำนวนที่ต้องการถอน เช่น `0.0005` โดยให้ยอดฝากเพียงพอ แล้วกด **Withdraw** และยืนยันใน MetaMask

ช่องจำนวนเงินใช้หน่วย **ETH** พอธุรกรรมยืนยันแล้ว เว็บจะอัปเดตยอดฝากและแสดงลิงก์สำหรับดูธุรกรรมบน Etherscan

## ข้อมูล Smart Contract

| รายการ | ข้อมูล |
| --- | --- |
| เครือข่าย | Ethereum Sepolia Testnet (`11155111`) |
| Contract Address | `0xC9557B2f87C9A85a5Aa74EB8963c69781dfF07b4` |
| โค้ด Solidity | [contracts/week6.sol](./contracts/week6.sol) |
| ABI | [src/contract/Bank.abi.json](./src/contract/Bank.abi.json) |

เว็บใช้ React, Vite และ ethers.js ส่วน Smart Contract เขียนด้วย Solidity และ deploy ผ่าน Remix IDE หน้าเว็บเผยแพร่ด้วย GitHub Pages

## รันโปรเจกต์บนเครื่อง

ใช้ **Node.js 24** ตามเวอร์ชันที่ตั้งไว้ใน GitHub Actions

```bash
git clone https://github.com/Rittiporn12/sepolia-bank-dapp.git
cd sepolia-bank-dapp
npm ci
npm run dev
```

เปิดลิงก์ที่ Terminal แสดง โดยปกติคือ `http://localhost:5173/sepolia-bank-dapp/`
