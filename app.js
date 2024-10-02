const newVacationFormEl = document.getElementsByTagName('form')[0];
const startDateInput = document.getElementById('start-date');
const endDateInput = document.getElementById('end-date');
const pastVacationContainer = document.getElementById('past-vacations');


//listen to form submissions
newVacationFormEl.addEventListener('submit', (event) => {
    event.preventDefault();

    const startDate = startDateInput.value;
    const endDate = endDateInput.value;

    if (checkDatesInvalid(startDate, endDate))
    {
        return;
        // Dont Submit, just exit
    }

    // store vacation in client side storage
    storeNewVacation(startDate, endDate);

    // refresh UI using local storage
    renderPastVacations();

    newVacationFormEl.reset();
});


function checkDatesInvalid(startDate, endDate)
{
    if (!startDate || !endDate || startDate > endDate)
    {
        console.log('Dates are not valid');
        newVacationFormEl.reset();

        return true;
    }
    else
    {
        return false;
    }
}


// add storage key as an app wide constant
const STORAGE_KEY = "vaca_tracker";

function storeNewVacation(startDate, endDate)
{
   const vacations = getAllStoredVacations(); // Returns array of strings


    //  Add New Vacation at end of array
    vacations.push({startDate, endDate});

    // sort the array by newest to oldest 
    vacations.sort((a, b) => {
        return new Date(b.startDate) - new Date(a.startDate);
    });

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(vacations));
}

function renderPastVacations()
{
    //  get the parsed string of vacations or an empty arra if there aren't any
    const vacations = getAllStoredVacations();

    // exit if no vacations 
    if (vacations.length === 0)
    {
        return;
    }

    pastVacationContainer.innerHTML = "";

    const pastVacationHeader = document.createElement('h2');
    pastVacationHeader.textContent = "Past Vacations";

    const pastVacationList = document.createElement('ul');

    vacations.forEach(vacation => {
        const vacationEl = document.createElement('li');
        vacationEl.textContent = `From ${formatDate(vacation.startDate)} to ${formatDate(vacation.endDate)}`;
        pastVacationList.appendChild(vacationEl);
    });

    pastVacationContainer.appendChild(pastVacationHeader);
    pastVacationContainer.appendChild(pastVacationList);
}

function getAllStoredVacations()
{
    const data = window.localStorage.getItem(STORAGE_KEY);
    // if no vacations are stored, default on empty array
    // otherwise return stored data => JSON String as Parsed JSON

    const vacations = data ? JSON.parse(data) : [];

    return vacations;
}

function formatDate(dateString)
{
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {timeZone: "UTC"});
}

// Start the app by rendering past vacations on load, if any
renderPastVacations();
