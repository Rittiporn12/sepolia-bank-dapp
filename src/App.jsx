import React, { useEffect, useRef, useState } from 'react'
import { BrowserProvider, Contract, formatEther, getAddress, parseEther } from 'ethers'
import bankAbi from './contract/Bank.abi.json'

const bankAddress = getAddress('0xc9557b2f87c9a85a5aa74eb8963c69781dff07b4')
const sepoliaChainId = 11155111n
const studentName = 'นายฤทธิพร ผึ่งผาย'
const studentId = '66088346'

export default function App() {
  const [address, setAddress] = useState('')
  const [balance, setBalance] = useState(null)
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState('')
  const [transactionHash, setTransactionHash] = useState('')
  const [busy, setBusy] = useState(false)
  const [copyStatus, setCopyStatus] = useState('')
  const walletRevision = useRef(0)
  const connecting = useRef(false)

  useEffect(() => {
    const wallet = window.ethereum
    if (!wallet?.on) return

    function resetConnection() {
      walletRevision.current += 1
      setAddress('')
      setBalance(null)
      setTransactionHash('')
      setStatus('บัญชีหรือเครือข่ายเปลี่ยนแล้ว กรุณาเชื่อม MetaMask อีกครั้ง')
    }

    function handleAccountsChanged() {
      if (!connecting.current) resetConnection()
    }

    wallet.on('accountsChanged', handleAccountsChanged)
    wallet.on('chainChanged', resetConnection)
    wallet.on('disconnect', resetConnection)
    return () => {
      wallet.removeListener('accountsChanged', handleAccountsChanged)
      wallet.removeListener('chainChanged', resetConnection)
      wallet.removeListener('disconnect', resetConnection)
    }
  }, [])

  async function copyContractAddress() {
    try {
      await navigator.clipboard.writeText(bankAddress)
      setCopyStatus('คัดลอกแล้ว')
    } catch {
      setCopyStatus('เลือกที่อยู่ด้านล่างแล้วคัดลอกด้วยตนเอง')
    }
  }

  async function interact(action) {
    const revision = walletRevision.current
    setBusy(true)
    setStatus('')
    setTransactionHash('')
    let confirmed = false

    try {
      if (!window.ethereum) throw new Error('กรุณาเปิดหน้านี้ในเบราว์เซอร์ที่ติดตั้ง MetaMask')
      const provider = new BrowserProvider(window.ethereum)
      const network = await provider.getNetwork()
      if (network.chainId !== sepoliaChainId) {
        throw new Error('กรุณาเลือก Ethereum Sepolia ใน MetaMask แล้วเชื่อมอีกครั้ง')
      }

      connecting.current = action === 'connect'
      const signer = await provider.getSigner()
      connecting.current = false
      const activeAddress = await signer.getAddress()
      if (revision !== walletRevision.current) return
      if (action !== 'connect' && activeAddress.toLowerCase() !== address.toLowerCase()) {
        throw new Error('กรุณาเชื่อมบัญชี MetaMask อีกครั้ง')
      }
      const bank = new Contract(bankAddress, bankAbi, signer)

      if (action === 'deposit' || action === 'withdraw') {
        const enteredAmount = amount.trim()
        if (!/^\d+(?:\.\d{1,18})?$/.test(enteredAmount)) {
          throw new Error('กรอกจำนวน ETH เป็นตัวเลข เช่น 0.001')
        }
        const value = parseEther(enteredAmount)
        if (value <= 0n) throw new Error('จำนวน ETH ต้องมากกว่า 0')
        if (action === 'withdraw' && value > await bank.checkBlance()) {
          throw new Error('จำนวนที่ถอนเกินยอดฝากของบัญชีนี้')
        }
        if (revision !== walletRevision.current) return

        setStatus('กรุณายืนยันธุรกรรมใน MetaMask')
        const transaction = action === 'deposit'
          ? await bank.deposit({ value })
          : await bank.withdraw(value)
        if (revision === walletRevision.current) {
          setTransactionHash(transaction.hash)
          setStatus('ส่งธุรกรรมแล้ว กำลังรอการยืนยันบน Sepolia')
        }
        await transaction.wait()
        confirmed = true
      }

      if (revision !== walletRevision.current) return
      const updatedBalance = await bank.checkBlance()
      if (revision !== walletRevision.current) return
      setAddress(activeAddress)
      setBalance(updatedBalance)
      if (confirmed) {
        setAmount('')
        setStatus(action === 'deposit' ? 'ฝากสำเร็จ' : 'ถอนสำเร็จ')
      }
    } catch (error) {
      if (revision !== walletRevision.current) return
      if (confirmed) {
        setBalance(null)
        setStatus('ธุรกรรมสำเร็จแล้ว กรุณากด Check Balance เพื่ออ่านยอดใหม่')
      } else {
        setStatus(error.code === 'ACTION_REJECTED' || error.code === 4001
          ? 'ยกเลิกการยืนยันใน MetaMask'
          : error.shortMessage ?? error.message ?? 'เกิดข้อผิดพลาด')
      }
    } finally {
      connecting.current = false
      setBusy(false)
    }
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
            <span>Sepolia Bank</span>
          </div>
          <p className="network"><span aria-hidden="true" /> Sepolia Testnet</p>
        </div>
      </header>

      <main className="shell">
        <div className="page-heading">
          <h1>ภาพรวมบัญชี</h1>
          <div className="student">
            <span className="student-name">{studentName}</span>
            <span className="student-id">รหัสนักศึกษา {studentId}</span>
          </div>
        </div>

        <div className="dashboard">
          <section className="balance-card" aria-labelledby="balance-title">
            <div className="balance-top">
              <h2 id="balance-title">ยอดฝากในสัญญา</h2>
              <span className="currency-mark" aria-hidden="true">Ξ</span>
            </div>
            <p className="balance-amount">
              {balance === null ? '—' : formatEther(balance)} <span>ETH</span>
            </p>
            <button className="balance-button" type="button" disabled={!address || busy}
              onClick={() => interact('balance')}>
              <span aria-hidden="true">↻</span> Check Balance
            </button>
          </section>

          <section className="panel wallet-panel" aria-labelledby="wallet-title">
            <div className="wallet">
              <span className="wallet-mark" aria-hidden="true">◇</span>
              <div className="wallet-details">
                <h2 id="wallet-title">กระเป๋า MetaMask</h2>
                <p className="account">{address || 'ยังไม่ได้เชื่อมบัญชี'}</p>
              </div>
              <button className="secondary connect-button" type="button" disabled={busy}
                onClick={() => interact('connect')}>
                {address ? 'เชื่อมอีกครั้ง' : 'Connect MetaMask'}
              </button>
            </div>
          </section>

          <section className="panel transfer" aria-labelledby="transfer-title">
            <h2 id="transfer-title">ฝากและถอน</h2>
            <label htmlFor="amount">จำนวนเงิน</label>
            <div className="amount-field">
              <input id="amount" type="text" inputMode="decimal" placeholder="0.001"
                aria-describedby="amount-unit" value={amount} disabled={!address || busy}
                onChange={(event) => setAmount(event.target.value)} />
              <span id="amount-unit">ETH</span>
            </div>
            <div className="actions">
              <button type="button" disabled={!address || busy || !amount.trim()}
                onClick={() => interact('deposit')}>
                <span aria-hidden="true">↓</span> Deposit
              </button>
              <button className="secondary" type="button" disabled={!address || busy || !amount.trim()}
                onClick={() => interact('withdraw')}>
                <span aria-hidden="true">↑</span> Withdraw
              </button>
            </div>
          </section>

          <section className="panel status-panel" aria-labelledby="status-title">
            <h2 id="status-title">สถานะการใช้งาน</h2>
            <p className="feedback" role="status">
              {status || (busy ? 'กำลังดำเนินการ…' : address
                ? 'เชื่อมต่อ Sepolia แล้ว พร้อมฝาก ถอน และเช็กยอด'
                : 'เชื่อมต่อ MetaMask บน Sepolia เพื่อเริ่มใช้งาน')}
            </p>
            {transactionHash && (
              <a className="transaction-link" href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
                target="_blank" rel="noreferrer">
                ดูธุรกรรมบน Etherscan <span aria-hidden="true">↗</span>
              </a>
            )}
          </section>

          <section className="panel contract-panel" aria-labelledby="contract-title">
            <div className="contract-heading">
              <h2 id="contract-title">ที่อยู่สัญญา Bank</h2>
              <button className="secondary" type="button" onClick={copyContractAddress}>
                คัดลอกที่อยู่
              </button>
            </div>
            <code className="contract-address">{bankAddress}</code>
            <div className="contract-links">
              <a href={`https://sepolia.etherscan.io/address/${bankAddress}`} target="_blank" rel="noreferrer">
                ดูบน Etherscan <span aria-hidden="true">↗</span>
              </a>
              <span className="copy-status" role="status">{copyStatus}</span>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
