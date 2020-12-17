App = {
    loading: false,
    contracts: {},
  
    load: async () => {
      await App.loadWeb3()
      await App.loadAccount()
      await App.loadContract()
      await App.render()
    },
  
    loadWeb3: async () => {
      if (typeof web3 !== 'undefined') {
        App.web3Provider = web3.currentProvider
        web3 = new Web3(web3.currentProvider)
      } else {
        window.alert("Please connect to Metamask.")
      }
      // Modern dapp browsers...
      if (window.ethereum) {
        window.web3 = new Web3(ethereum)
        try {
          // Request account access if needed
          await ethereum.enable()
          // Acccounts now exposed
          web3.eth.sendTransaction({/* ... */})
        } catch (error) {
          // User denied account access...
        }
      }
      else if (window.web3) {
        App.web3Provider = web3.currentProvider
        window.web3 = new Web3(web3.currentProvider)
        // Acccounts always exposed
        web3.eth.sendTransaction({/* ... */})
      }
      else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
      }
    },
  
    loadAccount: async () => {
      // Set the current blockchain account
      App.account = web3.eth.accounts[0]
      console.log(App.account)
      console.log(web3.eth)
    },
  
    loadContract: async () => {
      // Create a JavaScript version of the smart contract
      const ticketSystem = await $.getJSON('TicketSystem.json')
      App.contracts.TicketSystem = TruffleContract(ticketSystem)
      App.contracts.TicketSystem.setProvider(App.web3Provider)
      // Hydrate the smart contract with values from the blockchain
      App.tickets  = await App.contracts.TicketSystem.deployed()

      console.log(App.contracts.TicketSystem.address)
    },
  
    render: async () => {
      // Prevent double render
      if (App.loading) {
        return
      }
  
      // Update app loading state
      App.setLoading(true)
  
      // Render Account
      $('#account').html(App.account)
  
      // Render Tasks
      await App.renderTasks()
  
      // Update loading state
      App.setLoading(false)
    },
    // Can implement sell ticket for each particular ticket (As opposed to first ticket available)
    renderTasks: async () => {
      // Load the total task count from the blockchain
      const ticketCount = await App.tickets.tot_tickets()
      const gg = await App.tickets.balanceOf()
      console.log(ticketCount)
      console.log(gg)
      for(var i=0;i<5;i++)
      {
    	  const latest_tick = await App.tickets.tickets(i)
		    console.log(latest_tick)
      }
      const $taskTemplate = $('.taskTemplate')
      var ul1 = document.getElementById("ticketList");
      for(var i = 0;i<ticketCount;i++)
      {
        const latest_tick = await App.tickets.tickets(i)
        const $newTaskTemplate = $taskTemplate.clone()
        if(latest_tick[0] == App.account && latest_tick[2]=="unavailable")
        {
          var li = document.createElement("li");
          var button = document.createElement("button");
          button.innerHTML = `Ticket ID : ${i}`;
          button.setAttribute("class","btn btn-info")
          button.setAttribute("style","margin-top:5px")
          li.appendChild(button);
          ul1.appendChild(li);
          
        }
        
      }
      var ul2 = document.getElementById("transferList");
      for(var i = 0;i<ticketCount;i++)
      {
        const latest_tick = await App.tickets.tickets(i)
        const $newTaskTemplate = $taskTemplate.clone()
        if(latest_tick[0] == App.account && (latest_tick[2]=="up_for_transfer" || latest_tick[2]=="available"))
        {
          var li = document.createElement("li");
          var button = document.createElement("button");
          var res = `Withdraw - Ticket ID : ${i} `
          var tick_state = latest_tick[2]
          
          if(tick_state == "available")
          {
            res = res.concat(" : Public Transfer ")
          }
          else
          {
            res = res.concat(" : Private Transfer")
          }
          button.innerHTML = res;
          button.setAttribute("class","btn btn-info")
          button.setAttribute("style","margin-top:5px")
          button.setAttribute("onclick",`App.withdrawTransfer(${i})`)
          li.appendChild(button);
          ul2.appendChild(li);
          
        }
        
      }
      var ul = document.getElementById("redeemList");
      
      const $redeemTemplate = $('.redeemTemplate')
      for(var i=0;i<ticketCount;i++)
      {
        const latest_tick = await App.tickets.tickets(i)
        const $newredeemTemplate = $redeemTemplate.clone()
        if(latest_tick[3] == App.account)
        {
          var li = document.createElement("li");
          
          var button = document.createElement("button");
          button.innerHTML = `Accept - Ticket ID:${i}`;
          button.setAttribute("class","btn btn-success")
          button.setAttribute("id",i)
          button.setAttribute("onclick",`App.acceptTicket(${i})`)
          li.appendChild(button);
          
          ul.appendChild(li);
        }
      }
      var closebtns = document.getElementsByClassName("gg");
      for (i = 0; i < closebtns.length; i++) {
        console.log(closebtns[i].setAttribute("innerHTML",i+10))
      };
	},
	buyTicket : async () => {
		App.setLoading(true)
		await App.tickets.buyTicket({
			from: App.account,
			value: 1000000000000000000,
			gas: "4712388"
		  })
		window.location.reload()
	},
	sellTicket : async () => {
    App.setLoading(true)
    const TransferID = $('#ticketid_redeem').val()
    console.log(TransferID)
		await App.tickets.redeem_to_pool(App.account, TransferID)
		window.location.reload()
  },
  sellTransfer : async () => {
    App.setLoading(true)
    const TransferAddr = $('#newTask').val()
    const TransferID = $('#ticketid_transfer').val()
    
    console.log(TransferAddr)
    console.log(TransferID)
    await App.tickets.sell_to(TransferAddr,TransferID)
    window.location.reload()

  },
  acceptTicket : async (ticket_id) => {
  App.setLoading(true)
 
    console.log(ticket_id)
    await App.tickets.acceptTicket(ticket_id,
      {
        from: App.account,
        value: 1000000000000000000,
        gas: "4712388"
      }
    )
    window.location.reload()
  },
  withdrawTransfer : async (ticket_id) =>{
    await App.tickets.withdrawTransfer(ticket_id)
    window.location.reload()
  },

  setLoading: (boolean) => {
    App.loading = boolean
    const loader = $('#loader')
    const content = $('#content')
    if (boolean) {
      loader.show()
      content.hide()
    } else {
      loader.hide()
      content.show()
    }
  }
}
  
  $(() => {
    $(window).load(() => {
      App.load()
    })
  })