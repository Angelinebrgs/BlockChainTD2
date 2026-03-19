# 🗳️ Élection Présidentielle On-Chain

## 📌 Description

Ce projet est une application web développée avec **React + Vite** permettant d’interagir avec un **smart contract déployé sur le réseau Sepolia (Ethereum testnet)**.

L’objectif est de simuler une élection présidentielle on-chain où les utilisateurs peuvent :

* consulter les résultats en temps réel
* se connecter avec MetaMask
* voter pour un candidat
* respecter un délai de 3 minutes entre chaque vote
* visualiser les transactions sur la blockchain

---

## ⚙️ Technologies utilisées

* React (Vite)
* Ethers.js
* MetaMask
* Ethereum Sepolia Testnet

---

## 🚀 Installation et lancement

```bash
unzip starter.zip
cd starter
npm install
npm run dev
```

Puis ouvrir :

```
http://localhost:5173
```

---

## 🔗 Connexion à MetaMask

1. Installer MetaMask
2. Activer les réseaux de test
3. Sélectionner **Sepolia**
4. Récupérer de l’ETH de test (faucet)

---

## 🧠 Fonctionnalités principales

### 📊 Lecture des résultats

Les résultats sont récupérés directement depuis la blockchain via les fonctions `view` du smart contract.

➡️ Aucun wallet n’est nécessaire pour lire les données.

---

### 🔐 Connexion utilisateur

Connexion via MetaMask avec :

```js
eth_requestAccounts
```

Vérification du réseau (Sepolia) avant toute interaction.

---

### 🗳️ Vote

* Signature via MetaMask
* Envoi d’une transaction on-chain
* Attente de confirmation (`tx.wait()`)

---

### ⏳ Cooldown (3 minutes)

Après un vote :

* un délai de 3 minutes est imposé
* géré côté smart contract
* affiché côté frontend avec un compte à rebours

---

### ⚡ Écoute des événements

L’application écoute l’événement :

```
Voted(address voter, uint256 candidateIndex)
```

Permet :

* mise à jour automatique des résultats
* affichage en temps réel des votes

---

### ⛓️ Mini Blockchain Explorer

Affichage des 20 derniers votes avec :

* hash de transaction
* numéro de bloc
* votant
* candidat
* timestamp
* gas utilisé

---

## 🧩 Architecture du projet

```
src/
├── App.jsx        → logique principale
├── abi.json       → ABI du smart contract
├── config.js      → adresse + réseau
```

---

## ❓ Questions de compréhension

### 1. Pourquoi les scores s’affichent sans MetaMask ?

Les données de la blockchain sont publiques.
Les fonctions `view` peuvent être appelées sans signature ni wallet.

---

### 2. Peut-on voter avec l’adresse d’un autre ?

Non. Une adresse seule ne suffit pas.
Il faut la **clé privée** pour signer la transaction.

---

### 3. Qui vérifie le cooldown ?

Le **smart contract**.
Le frontend ne fait qu’afficher l’information.

---

### 4. Pourquoi pas `Date.now()` ?

L’heure locale n’est pas fiable.
La blockchain utilise `block.timestamp`, qui fait foi.

---

### 5. Pourquoi `off()` sur les events ?

Pour éviter d’accumuler des listeners et provoquer :

* des doublons
* des bugs
* des memory leaks

---

### 6. Pourquoi la blockchain est immuable ?

Chaque bloc contient le hash du précédent (`parentHash`).
Modifier un bloc casserait toute la chaîne.

---

## ✅ Conclusion

Ce projet démontre les principes fondamentaux d’une application Web3 :

* interaction avec un smart contract
* séparation frontend / blockchain
* sécurité via signature
* immutabilité des données
* transparence des transactions