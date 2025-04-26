const contractAddress = "0x7619158DF32B5208ef2057B005C96E981B87A213";
const contractABI = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [],
		"name": "AllReservationsCleared",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "seatId",
				"type": "string"
			}
		],
		"name": "bookSeat",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "clearAllReservations",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "seatId",
				"type": "string"
			}
		],
		"name": "SeatBooked",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "getMySeats",
		"outputs": [
			{
				"internalType": "string[]",
				"name": "",
				"type": "string[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "seatId",
				"type": "string"
			}
		],
		"name": "getSeatOwner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "seatOwners",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "ticketPrice",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalSeats",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "userSeats",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

let web3;
let contract;
let userAccount;
let selectedSeats = [];

async function connectWallet() {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    await ethereum.request({ method: 'eth_requestAccounts' });
    const accounts = await web3.eth.getAccounts();
    userAccount = accounts[0];
    contract = new web3.eth.Contract(contractABI, contractAddress);

    const balance = await web3.eth.getBalance(userAccount);
    const ethBalance = web3.utils.fromWei(balance, 'ether');

    document.getElementById("walletInfo").innerText = `🟢 บัญชี: ${userAccount}\n💰 คงเหลือ: ${ethBalance} ETH`;

    renderGrid();
    highlightBookedSeats();
    showMySeats();
  } else {
    alert("กรุณาติดตั้ง Metamask");
  }
}

function renderGrid() {
  const grid = document.getElementById("seatGrid");
  grid.innerHTML = "";
  const rows = "ABCDEFGHIJ";
  for (let i = 0; i < 10; i++) {
    for (let j = 1; j <= 10; j++) {
      const seatId = `${rows[i]}${j.toString().padStart(2, '0')}`;
      const div = document.createElement("div");
      div.innerText = seatId;
      div.className = "seat available";
      div.id = seatId;
      div.onclick = () => toggleSelect(seatId);
      grid.appendChild(div);
    }
  }
}

async function toggleSelect(seatId) {
  const seat = document.getElementById(seatId);
  if (seat.classList.contains("booked")) return;

  if (seat.classList.contains("selected")) {
    seat.classList.remove("selected");
    selectedSeats = selectedSeats.filter(s => s !== seatId);
  } else {
    seat.classList.add("selected");
    selectedSeats.push(seatId);
  }
}

async function bookSelectedSeats() {
  if (!userAccount) return alert("กรุณาเชื่อมต่อบัญชี Metamask");
  for (const seatId of selectedSeats) {
    await contract.methods.bookSeat(seatId).send({
      from: userAccount,
      value: web3.utils.toWei("0.005", "ether")
    });
  }
  selectedSeats = [];
  alert("จองสำเร็จ!");
}

async function highlightBookedSeats() {
  const rows = "ABCDEFGHIJ";
  for (let i = 0; i < 10; i++) {
    for (let j = 1; j <= 10; j++) {
      const seatId = `${rows[i]}${j.toString().padStart(2, '0')}`;
      const owner = await contract.methods.getSeatOwner(seatId).call();
      if (owner !== "0x0000000000000000000000000000000000000000") {
        const seat = document.getElementById(seatId);
        seat.classList.remove("available");
        seat.classList.add("booked");
      }
    }
  }
}

async function showMySeats() {
  if (!userAccount) return alert("กรุณาเชื่อมต่อบัญชี Metamask");

  const mySeats = await contract.methods.getMySeats().call({ from: userAccount });
  const list = document.getElementById("mySeats");
  list.innerHTML = "";
  mySeats.forEach(seat => {
    const li = document.createElement("li");
    li.innerText = seat;
    list.appendChild(li);
  });
}

async function clearAll() {
  if (!userAccount) return alert("กรุณาเชื่อมต่อบัญชี Metamask");
  try {
    await contract.methods.clearAllReservations().send({ from: userAccount });
    alert("ล้างการจองทั้งหมดแล้ว");
  } catch (err) {
    alert("ไม่สามารถล้างได้ (อาจไม่ใช่เจ้าของระบบ)");
  }
}

function logout() {
  alert("Log out เรียบร้อย (โปรดปิดหน้าเว็บหรือเปลี่ยนบัญชีบน Metamask)");
  location.href="index.html";
}