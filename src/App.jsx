import { useState, useEffect } from 'react'
import { BrowserProvider, Contract } from 'ethers'
import ABI from './abi.json'
import { CONTRACT_ADDRESS, EXPECTED_CHAIN_ID, EXPECTED_NETWORK_NAME } from './config'
import './index.css'

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  mint:          '#17ebbd',
  mintGlow:      'rgba(23,235,189,0.25)',
  mintDim:       'rgba(23,235,189,0.1)',
  mintBorder:    'rgba(23,235,189,0.2)',
  orange:        '#ed622c',
  orangeDim:     'rgba(237,98,44,0.1)',
  orangeBorder:  'rgba(237,98,44,0.3)',
  gold:          '#efba32',
  goldDim:       'rgba(239,186,50,0.1)',
  goldBorder:    'rgba(239,186,50,0.3)',
  goldGlow:      'rgba(239,186,50,0.25)',
  teal:          '#02988e',
  tealDark:      '#152b2d',
  bg:            '#081213',
  bgCard:        '#0d2022',
  bgCard2:       '#0f1e20',
  bgExplorer:    '#0f2326',
  border:        'rgba(217,217,217,0.12)',
  text:          '#d9d9d9',
  textMuted:     '#abd2d6',
  textDim:       '#4a6b6f',
  error:         '#cf2f26',
  errorDim:      'rgba(207,47,38,0.1)',
  errorBorder:   'rgba(207,47,38,0.3)',
  success:       '#2baa93',
  successDim:    'rgba(43,170,147,0.1)',
  successBorder: 'rgba(43,170,147,0.3)',
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #081213 0%, #0a1a1c 50%, #081213 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 20px',
    fontFamily: "'JetBrains Mono', monospace",
    animation: 'fadeInUp 0.4s ease',
  },
  nav: {
    width: '100%',
    maxWidth: '900px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '60px',
    borderBottom: `0.5px solid ${C.border}`,
    paddingBottom: '20px',
  },
  logo: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  logoDot: { color: C.orange },
  badge: {
    background: C.orangeDim,
    border: `0.5px solid ${C.orangeBorder}`,
    color: C.orange,
    padding: '4px 14px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
  },
  hero: {
    textAlign: 'center',
    marginBottom: '60px',
    maxWidth: '620px',
  },
  tag: {
    display: 'inline-block',
    background: C.mintDim,
    border: `0.5px solid ${C.mintBorder}`,
    color: C.mint,
    padding: '4px 14px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    marginBottom: '24px',
  },
  h1: {
    fontSize: '44px',
    fontWeight: '800',
    lineHeight: '1.1',
    marginBottom: '16px',
    letterSpacing: '-0.5px',
    background: 'linear-gradient(135deg, #ffffff 0%, #abd2d6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    fontSize: '14px',
    color: C.textMuted,
    lineHeight: '1.8',
    letterSpacing: '0.3px',
    fontWeight: '300',
  },
  card: {
    background: C.bgCard,
    border: `0.5px solid ${C.border}`,
    borderRadius: '8px',
    padding: '32px',
    width: '100%',
    maxWidth: '900px',
    marginBottom: '20px',
    boxShadow: '0px 10px 34px rgba(0,0,0,0.5)',
  },
  cardTitle: {
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    color: C.textDim,
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  cardTitleAccent: {
    display: 'inline-block',
    width: '3px',
    height: '12px',
    background: C.mint,
    borderRadius: '2px',
    boxShadow: `0 0 6px ${C.mintGlow}`,
    flexShrink: 0,
  },
  connectBtn: {
    background: C.mint,
    color: '#081213',
    border: 'none',
    padding: '13px 32px',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: '0 auto',
    letterSpacing: '0.5px',
    boxShadow: `0 0 24px ${C.mintGlow}`,
    transition: 'all 0.2s ease',
  },
  addressPill: {
    background: C.mintDim,
    border: `0.5px solid ${C.mintBorder}`,
    borderRadius: '6px',
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: 'fit-content',
    margin: '0 auto',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: C.mint,
    boxShadow: `0 0 6px ${C.mint}`,
    flexShrink: 0,
    animation: 'pulse-dot 2s ease-in-out infinite',
  },
  addressText: {
    color: C.mint,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '13px',
    fontWeight: '600',
    letterSpacing: '0.5px',
  },
  networkLabel: {
    color: C.textDim,
    fontSize: '12px',
    letterSpacing: '0.3px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  },
  candidateCard: {
    background: C.bgCard2,
    border: `0.5px solid ${C.border}`,
    borderRadius: '8px',
    padding: '28px 20px',
    textAlign: 'center',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    boxShadow: '0px 4px 34px rgba(0,0,0,0.5)',
    position: 'relative',
    overflow: 'hidden',
  },
  candidateCardHover: {
    border: `0.5px solid ${C.goldBorder}`,
    boxShadow: `0px 4px 34px rgba(0,0,0,0.5), 0 0 20px ${C.goldDim}`,
  },
  candidateCardTop: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: '2px',
    background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
    opacity: 0,
    transition: 'opacity 0.2s ease',
  },
  candidateIcon: {
    fontSize: '28px',
    marginBottom: '14px',
    display: 'block',
  },
  candidateName: {
    fontSize: '13px',
    fontWeight: '600',
    color: C.text,
    marginBottom: '16px',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  candidateVotes: {
    fontSize: '36px',
    fontWeight: '800',
    color: C.gold,
    marginBottom: '2px',
    lineHeight: '1',
    textShadow: `0 0 20px ${C.goldGlow}`,
  },
  candidateVotesLabel: {
    fontSize: '10px',
    color: C.textDim,
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    marginBottom: '10px',
  },
  // ── Amélioration 1 : progress bar ──────────────────────────────────────────
  progressWrap: {
    width: '100%',
    height: '3px',
    background: 'rgba(217,217,217,0.07)',
    borderRadius: '2px',
    overflow: 'hidden',
    marginBottom: '6px',
  },
  progressPct: {
    fontSize: '10px',
    color: C.textDim,
    letterSpacing: '0.5px',
    textAlign: 'right',
    marginBottom: '16px',
  },
  voteBtn: {
    background: C.mintDim,
    border: `0.5px solid ${C.mintBorder}`,
    color: C.mint,
    padding: '9px 20px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.2s ease',
    letterSpacing: '0.5px',
    fontFamily: "'JetBrains Mono', monospace",
  },
  voteBtnDisabled: {
    opacity: 0.35,
    cursor: 'not-allowed',
  },
  // ── Amélioration 2 : tx status banner ──────────────────────────────────────
  txBanner: {
    background: C.mintDim,
    border: `0.5px solid ${C.mintBorder}`,
    borderRadius: '6px',
    padding: '13px 20px',
    color: C.textMuted,
    fontSize: '12px',
    marginTop: '16px',
    letterSpacing: '0.3px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  // ── Feedback banners ───────────────────────────────────────────────────────
  error: {
    background: C.errorDim,
    border: `0.5px solid ${C.errorBorder}`,
    borderRadius: '6px',
    padding: '12px 20px',
    color: C.error,
    fontSize: '13px',
    marginTop: '16px',
    textAlign: 'center',
    letterSpacing: '0.3px',
  },
  success: {
    background: C.successDim,
    border: `0.5px solid ${C.successBorder}`,
    borderRadius: '6px',
    padding: '12px 20px',
    color: C.success,
    fontSize: '13px',
    marginTop: '16px',
    textAlign: 'center',
    letterSpacing: '0.3px',
  },
  eventBanner: {
    background: C.mintDim,
    border: `0.5px solid ${C.mintBorder}`,
    borderRadius: '6px',
    padding: '12px 20px',
    color: C.textMuted,
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    letterSpacing: '0.3px',
    marginTop: '16px',
  },
  // ── Amélioration 4 : explorer ──────────────────────────────────────────────
  explorerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  explorerToggleBtn: {
    background: 'transparent',
    border: `0.5px solid ${C.border}`,
    color: C.textMuted,
    padding: '7px 16px',
    borderRadius: '4px',
    fontSize: '11px',
    cursor: 'pointer',
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: '0.5px',
    transition: 'all 0.2s ease',
  },
  explorerTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '11px',
    fontFamily: "'JetBrains Mono', monospace",
    marginTop: '16px',
  },
  explorerTh: {
    textAlign: 'left',
    padding: '8px 12px',
    color: C.textDim,
    fontSize: '10px',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    borderBottom: `0.5px solid ${C.border}`,
    fontWeight: '600',
  },
  explorerTd: {
    padding: '10px 12px',
    borderBottom: `0.5px solid rgba(23,235,189,0.06)`,
    color: C.textMuted,
    verticalAlign: 'middle',
  },
  explorerEmpty: {
    textAlign: 'center',
    padding: '32px',
    color: C.textDim,
    fontSize: '12px',
    letterSpacing: '0.3px',
  },
  spinner: {
    display: 'inline-block',
    width: '14px',
    height: '14px',
    border: `2px solid ${C.mintBorder}`,
    borderTopColor: C.mint,
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    verticalAlign: 'middle',
    marginRight: '8px',
  },
  // ── Amélioration 5 : accordion ─────────────────────────────────────────────
  accordionItem: {
    borderBottom: `0.5px solid ${C.border}`,
  },
  accordionBtn: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    padding: '16px 0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    color: C.text,
    fontSize: '13px',
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: '0.3px',
    textAlign: 'left',
    gap: '12px',
  },
  accordionContent: {
    padding: '0 0 18px 0',
    color: C.textMuted,
    fontSize: '12px',
    lineHeight: '1.9',
    letterSpacing: '0.3px',
    fontWeight: '300',
  },
  footer: {
    marginTop: '60px',
    color: C.textDim,
    fontSize: '11px',
    textAlign: 'center',
    letterSpacing: '0.5px',
    borderTop: `0.5px solid ${C.border}`,
    paddingTop: '20px',
    width: '100%',
    maxWidth: '900px',
  },
}

// ─── Static data ──────────────────────────────────────────────────────────────
const ICONS = ['🌐', '🔒', '🤝']

const ACCORDION_ITEMS = [
  {
    title: '① Connexion MetaMask',
    content: "MetaMask est votre identité sur la blockchain. Quand vous cliquez 'Connecter', MetaMask expose votre adresse publique (0x...) à l'application. Cette adresse est votre identifiant unique — il n'y a pas de login, pas de mot de passe, pas de serveur. La clé privée ne quitte jamais MetaMask.",
  },
  {
    title: '② Signer une transaction',
    content: "Voter = envoyer une transaction à un smart contract. MetaMask calcule le hash de cette transaction, le signe avec votre clé privée (algorithme ECDSA), et diffuse la transaction signée sur le réseau Ethereum. Le réseau vérifie la signature — sans jamais voir votre clé privée — et confirme que c'est bien vous qui avez voté.",
  },
  {
    title: '③ Confirmation on-chain',
    content: "Une fois signée, la transaction entre dans le mempool — la file d'attente des transactions en attente. Un validateur la sélectionne et l'inclut dans un bloc. Sur Ethereum Sepolia, ça prend ~12 secondes. Après ~12,8 minutes (2 époques), le bloc est finalisé : le vote est irréversible, public, et vérifiable par tous sur Etherscan.",
  },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function TxStatusBanner({ status }) {
  if (!status) return null
  const short = (h) => `${h.slice(0, 8)}...${h.slice(-6)}`
  const steps = {
    1: { icon: '⏳', label: 'Signature dans MetaMask...' },
    2: { icon: '📡', label: 'Transaction envoyée — hash :' },
    3: { icon: '⏱', label: 'En attente de confirmation (~12 secondes)...' },
    4: { icon: '✅', label: 'Incluse dans le bloc' },
  }
  const m = steps[status.step]
  return (
    <div style={S.txBanner}>
      <span>{m.icon}</span>
      <span style={{ color: C.textMuted }}>{m.label}</span>
      {(status.step === 2 || status.step === 3) && status.hash && (
        <span style={{ fontFamily: 'monospace', color: C.mint, fontSize: '11px' }}>
          {short(status.hash)}
        </span>
      )}
      {status.step === 4 && status.blockNumber && (
        <span style={{ color: C.gold }}>#{status.blockNumber}</span>
      )}
    </div>
  )
}

function Spinner() {
  return <span style={S.spinner} />
}

// ─── Main component ───────────────────────────────────────────────────────────
function App() {
  const [account, setAccount]                 = useState(null)
  const [provider, setProvider]               = useState(null)
  const [candidates, setCandidates]           = useState([])
  const [isVoting, setIsVoting]               = useState(false)
  const [hasVoted, setHasVoted]               = useState(false)
  const [error, setError]                     = useState(null)
  const [lastEvent, setLastEvent]             = useState(null)
  const [hoveredId, setHoveredId]             = useState(null)
  // Amélioration 2 & 3
  const [txStatus, setTxStatus]               = useState(null)
  const [txHash, setTxHash]                   = useState(null)
  // Amélioration 4
  const [explorerOpen, setExplorerOpen]       = useState(false)
  const [explorerEvents, setExplorerEvents]   = useState([])
  const [explorerLoading, setExplorerLoading] = useState(false)
  // Amélioration 5
  const [openAccordions, setOpenAccordions]   = useState({})

  // ── Chargement initial sans MetaMask ─────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      if (!window.ethereum) return
      try {
        const p = new BrowserProvider(window.ethereum)
        setProvider(p)
        await loadCandidates(p)
      } catch { /* silent — MetaMask non disponible */ }
    }
    init()
  }, [])

  // ── Wallet connection ────────────────────────────────────────────────────────
  const connectWallet = async () => {
    try {
      if (!window.ethereum) { setError("MetaMask n'est pas installé."); return }
      const _provider = new BrowserProvider(window.ethereum)
      await _provider.send("eth_requestAccounts", [])
      const network = await _provider.getNetwork()
      if (network.chainId !== BigInt(EXPECTED_CHAIN_ID)) {
        setError(`Mauvais réseau — connectez MetaMask sur ${EXPECTED_NETWORK_NAME}.`)
        return
      }
      const signer = await _provider.getSigner()
      const address = await signer.getAddress()
      setAccount(address)
      setProvider(_provider)
      setError(null)
      await loadCandidates(_provider)
    } catch { setError("Connexion refusée.") }
  }

  // ── Load candidates ──────────────────────────────────────────────────────────
  const loadCandidates = async (_provider) => {
    const c = new Contract(CONTRACT_ADDRESS, ABI, _provider)
    const count = await c.getCandidatesCount()
    const list = []
    for (let i = 0; i < Number(count); i++) {
      const [name, voteCount] = await c.getCandidate(i)
      list.push({ id: i, name, votes: Number(voteCount) })
    }
    setCandidates(list)
  }

  // ── Load explorer events (amélioration 4) ────────────────────────────────────
  const loadExplorerEvents = async (_provider) => {
    const p = _provider || provider
    if (!p) return
    setExplorerLoading(true)
    try {
      const explorerContract = new Contract(CONTRACT_ADDRESS, ABI, p)
      const raw = await explorerContract.queryFilter(explorerContract.filters.Voted(), -1000)
      const last10 = raw.slice(-10).reverse()
      const enriched = await Promise.all(last10.map(async (e) => {
        let timestamp = null
        let candidateName = `#${e.args.candidateIndex}`
        try {
          const block = await p.getBlock(e.blockNumber)
          timestamp = block?.timestamp ?? null
        } catch { /* silent */ }
        try {
          const [name] = await explorerContract.getCandidate(Number(e.args.candidateIndex))
          candidateName = name
        } catch { /* silent */ }
        return {
          hash: e.transactionHash,
          blockNumber: e.blockNumber,
          voter: e.args.voter,
          candidateName,
          timestamp,
        }
      }))
      setExplorerEvents(enriched)
    } catch {
      setExplorerEvents([])
    } finally {
      setExplorerLoading(false)
    }
  }

  // ── Vote (amélioration 2) ─────────────────────────────────────────────────────
  const vote = async (candidateId) => {
    try {
      setIsVoting(true)
      setError(null)
      setTxStatus({ step: 1 })
      const signer = await provider.getSigner()
      const voteContract = new Contract(CONTRACT_ADDRESS, ABI, signer)
      const already = await voteContract.hasVoted(account)
      if (already) { setHasVoted(true); setIsVoting(false); setTxStatus(null); return }
      const tx = await voteContract.vote(candidateId)
      setTxHash(tx.hash)
      setTxStatus({ step: 2, hash: tx.hash })
      setTxStatus({ step: 3, hash: tx.hash })
      const receipt = await tx.wait()
      setTxStatus({ step: 4, hash: tx.hash, blockNumber: receipt.blockNumber })
      await loadCandidates(provider)
      if (explorerOpen) loadExplorerEvents()
      setHasVoted(true)
    } catch (err) {
      setTxStatus(null)
      setError(err.code === 4001 ? "Transaction annulée." : "Erreur : " + err.message)
    } finally {
      setIsVoting(false)
    }
  }

  // ── Listen to on-chain events ─────────────────────────────────────────────────
  useEffect(() => {
    if (!provider) return

    let listenContract
    try {
      listenContract = new Contract(CONTRACT_ADDRESS, ABI, provider)
      const handler = (voter, candidateIndex) => {
        setLastEvent({
          voter: voter.slice(0, 6) + '...' + voter.slice(-4),
          candidateName: `Candidat ${Number(candidateIndex)}`
        })
        loadCandidates(provider)
      }
      listenContract.on("Voted", handler)
      return () => {
        listenContract.off("Voted", handler)
      }
    } catch (err) {
      console.warn("Impossible d'écouter les events :", err.message)
    }
  }, [provider])

  // ── Load explorer when opened (pas besoin d'être connecté) ──────────────────
  useEffect(() => {
    if (explorerOpen && provider) loadExplorerEvents()
  }, [explorerOpen])

  // ── Derived ───────────────────────────────────────────────────────────────────
  const totalVotes = candidates.reduce((s, c) => s + c.votes, 0)
  const toggleAccordion = (i) => setOpenAccordions(prev => ({ ...prev, [i]: !prev[i] }))

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={S.page}>

      {/* ── Nav ── */}
      <nav style={S.nav}>
        <div style={S.logo}>
          dApp<span style={S.logoDot}>.</span>Vote
        </div>
        <span style={S.badge}>⬡ Sepolia Testnet</span>
      </nav>

      {/* ── Hero ── */}
      <div style={S.hero}>
        <div style={S.tag}>⛓ Live on Ethereum</div>
        <h1 style={S.h1}>Vote décentralisé<br />sans intermédiaire</h1>
        <p style={S.subtitle}>
          Chaque vote est une transaction signée sur la blockchain Ethereum.<br />
          Transparent, immuable, vérifiable par tous.
        </p>
      </div>

      {/* ── Wallet ── */}
      <div style={S.card}>
        <div style={S.cardTitle}>
          <span style={S.cardTitleAccent} />
          Wallet
        </div>
        {!account ? (
          <button style={S.connectBtn} onClick={connectWallet}>
            <span>🦊</span> Connecter MetaMask
          </button>
        ) : (
          <div style={S.addressPill}>
            <div style={S.dot} />
            <span style={S.addressText}>{account.slice(0, 6)}...{account.slice(-4)}</span>
            <span style={S.networkLabel}>· {EXPECTED_NETWORK_NAME}</span>
          </div>
        )}
        {error && <div style={S.error}>⚠ {error}</div>}
      </div>

      {/* ── Amélioration 5 : accordéon "Comment ça marche" ── */}
      <div style={S.card}>
          <div style={{ ...S.cardTitle, marginBottom: '8px' }}>
            <span style={S.cardTitleAccent} />
            💡 Comment fonctionne ce vote on-chain ?
          </div>
          {ACCORDION_ITEMS.map((item, i) => (
            <div key={i} style={{
              ...S.accordionItem,
              ...(i === ACCORDION_ITEMS.length - 1 ? { borderBottom: 'none' } : {}),
            }}>
              <button style={S.accordionBtn} onClick={() => toggleAccordion(i)}>
                <span>{item.title}</span>
                <span style={{
                  color: C.mint,
                  fontSize: '14px',
                  transition: 'transform 0.3s ease',
                  transform: openAccordions[i] ? 'rotate(180deg)' : 'rotate(0deg)',
                  display: 'inline-block',
                  flexShrink: 0,
                }}>▾</span>
              </button>
              <div
                className="accordion-body"
                style={{ maxHeight: openAccordions[i] ? '300px' : '0px' }}
              >
                <p style={S.accordionContent}>{item.content}</p>
              </div>
            </div>
          ))}
        </div>

      {/* ── Candidats (améliorations 1, 2, 3) ── */}
      {candidates.length > 0 && (
        <div style={S.card}>
          <div style={S.cardTitle}>
            <span style={S.cardTitleAccent} />
            Candidats
            <span style={{ marginLeft: 'auto', color: C.textMuted, fontSize: '11px', fontWeight: '400' }}>
              {totalVotes} vote{totalVotes !== 1 ? 's' : ''} enregistré{totalVotes !== 1 ? 's' : ''}
            </span>
          </div>

          <div style={S.grid}>
            {candidates.map((c) => {
              const hovered = hoveredId === c.id
              const pct = totalVotes > 0 ? Math.round((c.votes / totalVotes) * 100) : 0
              return (
                <div
                  key={c.id}
                  style={{ ...S.candidateCard, ...(hovered ? S.candidateCardHover : {}) }}
                  onMouseEnter={() => setHoveredId(c.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Gold top line on hover */}
                  <div style={{
                    ...S.candidateCardTop,
                    opacity: hovered ? 1 : 0,
                  }} />

                  <span style={S.candidateIcon}>{ICONS[c.id] || '◈'}</span>
                  <div style={S.candidateName}>{c.name}</div>
                  <div style={S.candidateVotes}>{c.votes}</div>
                  <div style={S.candidateVotesLabel}>votes</div>

                  {/* Amélioration 1 : barre de progression */}
                  <div style={S.progressWrap}>
                    <div style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, ${C.teal}, ${C.mint})`,
                      borderRadius: '2px',
                      transition: 'width 0.6s ease',
                      boxShadow: pct > 0 ? `0 0 8px ${C.mintGlow}` : 'none',
                    }} />
                  </div>
                  <div style={S.progressPct}>{pct}%</div>

                  {account && !hasVoted && (
                    <button
                      className="vote-btn"
                      style={{ ...S.voteBtn, ...(isVoting ? S.voteBtnDisabled : {}) }}
                      onClick={() => vote(c.id)}
                      disabled={isVoting}
                    >
                      {isVoting ? '⏳ En cours...' : 'Voter →'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          {/* Amélioration 2 : indicateur de statut de transaction */}
          {txStatus && (isVoting || txStatus.step === 4) && (
            <TxStatusBanner status={txStatus} />
          )}

          {/* Succès */}
          {hasVoted && (
            <div style={S.success}>
              ✓ Vote enregistré sur la blockchain Ethereum
            </div>
          )}

          {/* Amélioration 3 : lien Etherscan */}
          {hasVoted && txHash && (
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="etherscan-link"
              style={{
                display: 'block',
                color: C.mint,
                fontSize: '12px',
                textDecoration: 'none',
                marginTop: '10px',
                textAlign: 'center',
                letterSpacing: '0.3px',
                opacity: 0.75,
                transition: 'opacity 0.2s ease',
              }}
            >
              🔍 Voir la transaction sur Etherscan →
            </a>
          )}

          {/* Dernier event on-chain */}
          {lastEvent && (
            <div style={S.eventBanner}>
              <span style={{ color: C.mint }}>⚡</span>
              <span>
                Nouveau vote —{' '}
                <strong style={{ color: C.mint }}>{lastEvent.voter}</strong>
                {' '}→{' '}
                <strong style={{ color: C.gold }}>{lastEvent.candidateName}</strong>
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Amélioration 4 : Blockchain Explorer ── */}
      <div style={S.card}>
          <div style={S.explorerHeader}>
            <div style={{ ...S.cardTitle, marginBottom: 0 }}>
              <span style={S.cardTitleAccent} />
              ⛓ Blockchain Explorer
            </div>
            <button
              className="explorer-toggle-btn"
              style={S.explorerToggleBtn}
              onClick={() => setExplorerOpen(o => !o)}
            >
              {explorerOpen ? 'Masquer' : 'Afficher'}
            </button>
          </div>

          <div style={{
            maxHeight: explorerOpen ? '520px' : '0px',
            overflow: 'hidden',
            transition: 'max-height 0.4s ease',
          }}>
            {explorerLoading ? (
              <div style={{ textAlign: 'center', padding: '32px', color: C.textDim, fontSize: '12px' }}>
                <Spinner /> Chargement des données on-chain...
              </div>
            ) : explorerEvents.length === 0 ? (
              <div style={S.explorerEmpty}>
                Aucun vote enregistré sur la blockchain pour l'instant.
              </div>
            ) : (
              <table style={S.explorerTable}>
                <thead>
                  <tr>
                    <th style={S.explorerTh}>Tx Hash</th>
                    <th style={S.explorerTh}>Bloc</th>
                    <th style={S.explorerTh}>Votant</th>
                    <th style={S.explorerTh}>Candidat</th>
                    <th style={S.explorerTh}>Heure</th>
                  </tr>
                </thead>
                <tbody>
                  {explorerEvents.map((e, i) => (
                    <tr key={i} className="explorer-tr">
                      <td style={S.explorerTd}>
                        <a
                          href={`https://sepolia.etherscan.io/tx/${e.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: C.mint, textDecoration: 'none' }}
                        >
                          {e.hash.slice(0, 6)}...{e.hash.slice(-4)}
                        </a>
                      </td>
                      <td style={{ ...S.explorerTd, color: C.textDim }}>{e.blockNumber}</td>
                      <td style={S.explorerTd}>{e.voter.slice(0, 6)}...{e.voter.slice(-4)}</td>
                      <td style={{ ...S.explorerTd, color: C.gold }}>{e.candidateName}</td>
                      <td style={{ ...S.explorerTd, color: C.textDim, fontSize: '10px' }}>
                        {e.timestamp
                          ? new Date(e.timestamp * 1000).toLocaleString()
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      {/* ── Footer ── */}
      <footer style={S.footer}>
        Contrat déployé sur Ethereum Sepolia
        &nbsp;·&nbsp;
        <span style={{ color: C.mint }}>
          {CONTRACT_ADDRESS.slice(0, 6)}...{CONTRACT_ADDRESS.slice(-4)}
        </span>
      </footer>

    </div>
  )
}

export default App
