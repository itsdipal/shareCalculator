
document.addEventListener("DOMContentLoaded", function () {
  const sell = document.getElementById("Sell");
  const buy = document.getElementById("Buy");

  const sellRateContainer = document.getElementById("sell-rate-container");
  const investerTypeContainer = document.getElementById(
    "invester-type-container"
  );
  const cgtContainer = document.getElementById("cgt-container");

  const dtar_tap = document.getElementById("dtar-tap");
  const dtar = document.getElementById("dtar");
  const pl_ap = document.getElementById("pl_ap");

  const invester_type = document.getElementById("invester-type");  
  const cgtper = document.getElementById("cgtper"); 


 
  // ------------------------- HELPER -------------------------
  function resetResults() {
    document.getElementById('dtotal').innerHTML = '0.00';
    document.getElementById('dcommission').innerHTML = '0.00';
    document.getElementById('dsebon').innerHTML = '0.00';
    document.getElementById('dcharge').innerHTML = '0.00';
    document.getElementById('dcgt').innerHTML = '0.00';
    document.getElementById('dtar').innerHTML = '0.00';
    document.getElementById('pl_ap-value').innerHTML = '0.00';
  }

  // ------------------------- TOGGLE FORM -------------------------
  function toggleForm() {
    if (buy.checked) {
      sellRateContainer.classList.add("hidden-field");
      investerTypeContainer.classList.add("hidden-field");
      cgtContainer.classList.add("hidden-field");
      dtar_tap.innerHTML = "Total Amount Payable";
      pl_ap.innerHTML = "Price per Share";
    } else if (sell.checked) {
      sellRateContainer.classList.remove("hidden-field");
      investerTypeContainer.classList.remove("hidden-field");
      cgtContainer.classList.remove("hidden-field");
      dtar_tap.innerHTML = "Total Amount Receivable";
      pl_ap.innerHTML = "Profit/Loss";
    }

    // Only calculate if some input exists
    const sr = document.getElementById("sell-rate").value;
    const pr = document.getElementById("purchase-rate").value;
    const quantity = document.getElementById("quantity").value;

    if (sr || pr || quantity) {
      calculate_overall();
    } else {
      resetResults();
      return;
    }
  }

  sell.addEventListener("change", toggleForm);
  buy.addEventListener("change", toggleForm);
  toggleForm(); // run on page load

  // ------------------------- CGTPER -------------------------
  const initial_cgtper = cgtper.innerHTML;

  function update_cgtper() {
    const investerType = invester_type.value;
    if (investerType === "Institutional") {
      cgtper.disabled = true;
      cgtper.innerHTML = '<option value="10">10%</option>';
    } else {
      cgtper.disabled = false;
      cgtper.innerHTML = initial_cgtper;
    }
  }

  invester_type.addEventListener("change", update_cgtper);
  update_cgtper();

  // ------------------------- CALCULATE -------------------------
  const calculate = document.getElementById("calculate");

  function calculate_overall () {

    const sr = parseFloat(document.getElementById("sell-rate").value) || 0;

  

    const pr = parseFloat(document.getElementById("purchase-rate").value) || 0;
    const quantity = parseFloat(document.getElementById("quantity").value) || 0;
    const dtotal = document.getElementById("dtotal");


    let sellCheck = sell.checked && (sr === 0 || pr === 0 || quantity === 0);
    let buyCheck =buy.checked && (pr===0 || quantity===0);

    if(sellCheck==true){
      return;
    }

    if(buyCheck==true){
      return;
    }
 




//       if (!sr) {   // checks for NaN or 0
//   alert("Enter a selling price");
//   return;           // stops the rest of the function
// }

    
    const totalAmount = buy.checked ? pr * quantity : sr * quantity;
    const prs = pr * quantity;

    dtotal.innerHTML = totalAmount.toLocaleString("hi-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    // commission
    function commission(totalAmounts) {
      if(totalAmounts  <= 0) return 0;
      if (totalAmounts <= 2500) return 10;
      if (totalAmounts <= 50000) return (totalAmounts * 0.36) / 100;
      if (totalAmounts <= 2000000) return (totalAmounts * 0.31) / 100;
      if (totalAmounts <= 10000000) return (totalAmounts * 0.27) / 100;
      return (totalAmounts * 0.24) / 100;
    }

    const commissions = commission(totalAmount);
    document.getElementById("dcommission").innerHTML =
      commissions.toLocaleString("hi-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    // SEBON fee
    const sebons = (totalAmount * 0.015) / 100;
    document.getElementById("dsebon").innerHTML = sebons.toLocaleString(
      "hi-IN",
      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
    );

    // DP charge
    
    const dp = totalAmount>0?25:'0.00';
    document.getElementById("dcharge").innerHTML = dp;

    // total payable & receivable before tax
    let tar = totalAmount - commissions - sebons - dp;
    const taps = prs + commissions + dp + sebons;

    // capital gain tax
    function cgt() {
      const investorType = invester_type.value;
      const cgtValue = parseFloat(cgtper.value) || 0;
      let rate;

      if (investorType === "Individual") {
        rate = cgtValue === 5 ? 5 : 7.5;
      } else {
        rate = 10;
      }

      return tar - taps >= 0 ? ((tar - taps) * rate) / 100 : 0;
    }

    const cgts = cgt();
    document.getElementById("dcgt").innerHTML = cgts.toLocaleString("hi-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    tar = totalAmount - commissions - sebons - dp - cgts;

    if (buy.checked) {
      dtar.innerHTML = taps.toLocaleString("hi-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      document.getElementById("pl_ap-value").innerHTML = (
        taps / quantity
      ).toLocaleString("hi-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } else if (sell.checked) {
      dtar.innerHTML = tar.toLocaleString("hi-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      const profit_loss = tar - taps;
      document.getElementById("pl_ap-value").innerHTML =
        profit_loss.toLocaleString("hi-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
    }
  }

  calculate.addEventListener("click", calculate_overall);

  // ------------------------- CLEAR -------------------------
  const clearBtn = document.getElementById('clearButton');

  clearBtn.addEventListener('click', function() {
    document.getElementById('sell-rate').value = '';
    document.getElementById('purchase-rate').value = '';
    document.getElementById('quantity').value = '';
    document.getElementById('invester-type').selectedIndex = 0;

    document.getElementById('cgtper').disabled = false;
    document.getElementById('cgtper').innerHTML = initial_cgtper;

    resetResults();
    toggleForm(); // Adjust UI after clearing
  });
});


