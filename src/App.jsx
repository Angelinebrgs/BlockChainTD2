import { useEffect, useState } from 'react'
import { BrowserProvider, Contract } from 'ethers'
import ABI from './abi.json'
import {
  CONTRACT_ADDRESS,
  EXPECTED_CHAIN_ID,
  EXPECTED_NETWORK_NAME,
} from './config'

const CANDIDATE_NAMES = ['Léon Blum', 'Jacques Chirac', 'François Mitterrand']

function App() {
  const [account, setAccount] = useState(null)
  const [provider, setProvider] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [error, setError] = useState(null)

  const [isVoting, setIsVoting] = useState(false)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const [txHash, setTxHash] = useState(null)
  const [lastBlockNumber, setLastBlockNumber] = useState(null)

  const [lastEvent, setLastEvent] = useState(null)

  const [explorerEvents, setExplorerEvents] = useState([])
  const [explorerOpen, setExplorerOpen] = useState(false)
  const [explorerLoading, setExplorerLoading] = useState(false)

  const loadCandidates = async (_provider) => {
    try {
      const contract = new Contract(CONTRACT_ADDRESS, ABI, _provider)
      const count = await contract.getCandidatesCount()

      const list = []
      for (let i = 0; i < Number(count); i++) {
        const candidate = await contract.getCandidate(i)

        // Compatible avec retour tableau ou objet
        const name = candidate[0] ?? candidate.name ?? CANDIDATE_NAMES[i] ?? `Candidat #${i}`
        const voteCount = candidate[1] ?? candidate.voteCount ?? 0

        list.push({
          id: i,
          name,
          votes: Number(voteCount),
        })
      }

      setCandidates(list)
    } catch (err) {
      console.error('Erreur loadCandidates :', err)
      setError("Impossible de charger les candidats.")
    }
  }

  useEffect(() => {
    const init = async () => {
      if (!window.ethereum) return

      try {
        const p = new BrowserProvider(window.ethereum)
        setProvider(p)
        await loadCandidates(p)
      } catch (err) {
        console.warn('Init impossible :', err)
      }
    }

    init()
  }, [])

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setError("MetaMask n'est pas installé.")
        return
      }

      const _provider = new BrowserProvider(window.ethereum)
      await _provider.send('eth_requestAccounts', [])

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

      const contract = new Contract(CONTRACT_ADDRESS, ABI, _provider)
      const secondsLeft = Number(await contract.getTimeUntilNextVote(address))

      console.log('Cooldown initial =', secondsLeft)
      setCooldownSeconds(secondsLeft)
    } catch (err) {
      console.error(err)
      setError(err?.code === 4001 ? 'Connexion refusée.' : 'Erreur de connexion.')
    }
  }

  const vote = async (candidateIndex) => {
    try {
      if (!provider || !account) {
        setError("Connecte ton wallet avant de voter.")
        return
      }

      setIsVoting(true)
      setError(null)
      setTxHash(null)
      setLastBlockNumber(null)

      const signer = await provider.getSigner()
      const voteContract = new Contract(CONTRACT_ADDRESS, ABI, signer)

      const secondsLeft = Number(await voteContract.getTimeUntilNextVote(account))
      console.log('Cooldown avant vote =', secondsLeft)

      if (secondsLeft > 0) {
        setCooldownSeconds(secondsLeft)
        return
      }

      const tx = await voteContract.vote(candidateIndex)
      setTxHash(tx.hash)

      const receipt = await tx.wait()
      setLastBlockNumber(receipt.blockNumber)

      await loadCandidates(provider)

      // On relit le cooldown réel côté contrat
      const newSecondsLeft = Number(await voteContract.getTimeUntilNextVote(account))
      console.log('Cooldown après vote =', newSecondsLeft)
      setCooldownSeconds(newSecondsLeft > 0 ? newSecondsLeft : 3 * 60)
    } catch (err) {
      console.error(err)
      setError(err?.code === 4001 ? 'Transaction annulée.' : `Erreur : ${err.message}`)
    } finally {
      setIsVoting(false)
    }
  }

  // Timer stable
  useEffect(() => {
    if (cooldownSeconds <= 0) return

    const timer = setInterval(() => {
      setCooldownSeconds((prev) => Math.max(prev - 1, 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [cooldownSeconds > 0])

  useEffect(() => {
    console.log('cooldownSeconds =', cooldownSeconds)
  }, [cooldownSeconds])

  useEffect(() => {
    if (!provider) return

    let listenContract
    let handler

    try {
      listenContract = new Contract(CONTRACT_ADDRESS, ABI, provider)

      handler = (voter, candidateIndex) => {
        const idx = Number(candidateIndex)

        setLastEvent({
          voter: `${voter.slice(0, 6)}...${voter.slice(-4)}`,
          candidateName: CANDIDATE_NAMES[idx] ?? `Candidat #${idx}`,
        })

        loadCandidates(provider)
      }

      listenContract.on('Voted', handler)
    } catch (err) {
      console.warn("Impossible d'écouter les events :", err.message)
    }

    return () => {
      if (listenContract && handler) {
        listenContract.off('Voted', handler)
      }
    }
  }, [provider])

  const loadExplorerEvents = async () => {
    if (!provider) return

    setExplorerLoading(true)

    try {
      const ec = new Contract(CONTRACT_ADDRESS, ABI, provider)
      const raw = await ec.queryFilter(ec.filters.Voted(), -1000)
      const last20 = raw.slice(-20).reverse()

      const enriched = await Promise.all(
        last20.map(async (e) => {
          const idx = Number(e.args?.candidateIndex ?? e.args?.[1] ?? 0)

          let timestamp = null
          let gasUsed = null
          let voter = e.args?.voter ?? e.args?.[0] ?? 'Adresse inconnue'

          try {
            const block = await provider.getBlock(e.blockNumber)
            timestamp = block?.timestamp ?? null
          } catch {}

          try {
            const receipt = await provider.getTransactionReceipt(e.transactionHash)
            gasUsed = receipt?.gasUsed != null ? Number(receipt.gasUsed) : null
          } catch {}

          return {
            hash: e.transactionHash,
            blockNumber: e.blockNumber,
            voter,
            candidateName: CANDIDATE_NAMES[idx] ?? `Candidat #${idx}`,
            timestamp,
            gasUsed,
          }
        })
      )

      setExplorerEvents(enriched)
    } catch (err) {
      console.error('Erreur explorer :', err)
      setExplorerEvents([])
    } finally {
      setExplorerLoading(false)
    }
  }

  useEffect(() => {
    if (explorerOpen && provider) {
      loadExplorerEvents()
    }
  }, [explorerOpen, provider])

  return (
    <div
      style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '24px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h1>Élection Présidentielle On-Chain</h1>

      {!account ? (
        <button onClick={connectWallet}>Connecter MetaMask</button>
      ) : (
        <p>
          Connecté : <strong>{account}</strong> · {EXPECTED_NETWORK_NAME}
        </p>
      )}

      {error && <p style={{ color: 'red' }}>⚠ {error}</p>}

      <div
        style={{
          margin: '16px 0',
          padding: '12px',
          background: '#f7f7f7',
          borderRadius: '8px',
        }}
      >
        {cooldownSeconds > 0 ? (
          <>
            <p>⏳ Prochain vote disponible dans :</p>
            <p
              style={{
                fontSize: '32px',
                fontFamily: 'monospace',
                fontWeight: 'bold',
              }}
            >
              {String(Math.floor(cooldownSeconds / 60)).padStart(2, '0')}:
              {String(cooldownSeconds % 60).padStart(2, '0')}
            </p>
          </>
        ) : (
          <p>✅ Vous pouvez voter maintenant</p>
        )}

        <p style={{ fontSize: '12px', color: 'gray' }}>
          La blockchain enregistre l'heure de votre dernier vote via block.timestamp
        </p>
      </div>

      {lastEvent && (
        <div
          style={{
            background: '#f0fff0',
            padding: '10px',
            borderRadius: '8px',
            marginBottom: '16px',
          }}
        >
          ⚡ Nouveau vote — <strong>{lastEvent.voter}</strong> a voté pour{' '}
          <strong>{lastEvent.candidateName}</strong>
        </div>
      )}

      <h2>Résultats</h2>

      {candidates.length === 0 ? (
        <p>Chargement des candidats...</p>
      ) : (
        candidates.map((c) => (
          <div
            key={c.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px',
              marginBottom: '10px',
              border: '1px solid #ddd',
              borderRadius: '8px',
            }}
          >
            <div>
              <strong>{c.name}</strong> — {c.votes} vote(s)
            </div>

            {account && cooldownSeconds === 0 && (
              <button onClick={() => vote(c.id)} disabled={isVoting}>
                {isVoting ? '⏳ En cours...' : 'Voter →'}
              </button>
            )}
          </div>
        ))
      )}

      {txHash && <p>Transaction envoyée : {txHash}</p>}
      {lastBlockNumber && <p>✅ Incluse dans le bloc #{lastBlockNumber}</p>}

      <div style={{ marginTop: '24px' }}>
        <button onClick={() => setExplorerOpen((o) => !o)}>
          {explorerOpen ? 'Masquer' : '⛓ Blockchain Explorer'}
        </button>

        {explorerOpen && (
          <div style={{ marginTop: '16px', overflowX: 'auto' }}>
            {explorerLoading ? (
              <p>Chargement des données on-chain...</p>
            ) : explorerEvents.length === 0 ? (
              <p>Aucun vote enregistré pour l'instant.</p>
            ) : (
              <table
                border="1"
                cellPadding="8"
                style={{ borderCollapse: 'collapse', width: '100%' }}
              >
                <thead>
                  <tr>
                    <th>Tx Hash</th>
                    <th>Bloc</th>
                    <th>Votant</th>
                    <th>Candidat</th>
                    <th>Heure</th>
                    <th>Gas utilisé</th>
                  </tr>
                </thead>
                <tbody>
                  {explorerEvents.map((e, i) => (
                    <tr key={i}>
                      <td>
                        <a
                          href={`https://sepolia.etherscan.io/tx/${e.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {e.hash.slice(0, 10)}...{e.hash.slice(-6)}
                        </a>
                      </td>
                      <td>{e.blockNumber}</td>
                      <td>
                        {e.voter.slice(0, 10)}...{e.voter.slice(-6)}
                      </td>
                      <td>{e.candidateName}</td>
                      <td>
                        {e.timestamp
                          ? new Date(e.timestamp * 1000).toLocaleString('fr-FR')
                          : '—'}
                      </td>
                      <td>{e.gasUsed ? `${e.gasUsed.toLocaleString()} unités` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App