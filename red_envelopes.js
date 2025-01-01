// Contract Initialization (replace with your contract ABI and address)
const contractAddress = "YOUR_CONTRACT_ADDRESS_HERE";
const contractABI = [/* YOUR_CONTRACT_ABI_HERE */];
let web3, contract;

// Initialize Web3 and Contract
window.onload = async function () {
    if (typeof window.ethereum !== "undefined") {
        web3 = new Web3(window.ethereum);
        contract = new web3.eth.Contract(contractABI, contractAddress);
    } else {
        alert("MetaMask is not installed. Please install MetaMask to interact with this dApp.");
    }
};

// Fetch Available Red Envelopes
async function getAvailableRE(linkcode) {
    try {
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
        const userAddress = accounts[0];
        const linkcodeHex = web3.utils.asciiToHex(linkcode);
        const availableRE = await contract.methods
            .getAvailableRE(linkcodeHex)
            .call({ from: userAddress });

        displayResults(availableRE);
    } catch (error) {
        console.error("Error fetching available red envelopes:", error);
        alert("An error occurred while fetching available red envelopes.");
    }
}

// Display Results in Table
function displayResults(data) {
    const resultTable = document.getElementById("resultTable");
    const resultBody = document.getElementById("resultBody");

    // Clear previous results
    resultBody.innerHTML = "";

    if (data.length === 0) {
        alert("No available red envelopes found.");
        resultTable.hidden = true;
        return;
    }

    // Populate table rows
    data.forEach((item, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.creator}</td>
            <td>${web3.utils.hexToAscii(item.desc)}</td>
            <td>${item.subAmt}</td>
            <td>${item.claimedAmt}</td>
            <td>${item.maxClaims}</td>
            <td>${item.eligiType}</td>
        `;
        resultBody.appendChild(row);
    });

    // Show the table
    resultTable.hidden = false;
}

// Event Listener for Fetch Button
document.getElementById("fetchRE").addEventListener("click", () => {
    const linkcode = document.getElementById("linkcodeInput").value.trim();
    if (linkcode) {
        getAvailableRE(linkcode);
    } else {
        alert("Please enter a valid link code.");
    }
});
