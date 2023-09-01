const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.json());

const customers = require('./customer.json');

app.get('/customers', (req, res) => {
 
  const { firstName, lastName, city } = req.query;
  let results = customers;

  if (firstName) {
    results = results.filter(customer => customer.first_name.toLowerCase().includes(firstName.toLowerCase()));
  }
  if (lastName) {
    results = results.filter(customer => customer.last_name.toLowerCase().includes(lastName.toLowerCase()));
  }
  if (city) {
    results = results.filter(customer => customer.city.toLowerCase().includes(city.toLowerCase()));
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const skip = (page - 1) * limit;
  return res.status(201).json({
    page:page,
    limit:limit,
    data:results
  });
});

//  API to get single customer data by its id.
app.get('/customers/:id', (req, res) => {
  const customerId = parseInt(req.params.id);
  const customer = customers.find(customer => customer.id === customerId);

  if (!customer) {
    res.status(404).json({ message: 'Customer not found' });
  } else {
    return res.status(201).json(customer);
  }
});

/** @list all the unique cities with the number of customers from a particular city.*/
app.get('/cities', (req, res) => {
  const cityCounts = {};
  customers.forEach(customer => {
    if (cityCounts[customer.city]) {
      cityCounts[customer.city]++;
    } else {
      cityCounts[customer.city] = 1;
    }
  });
 return res.status(201)(cityCounts);
});

/**@API to add a customer with validations. */
app.post('/customers', (req, res) => {
  const newCustomer = req.body;
  if (!newCustomer.id || !newCustomer.first_name || !newCustomer.last_name || 
    !newCustomer.city || !newCustomer.company) {
  return  res.status(400).json({ message: 'All fields are required' });
  } else {
    // Checking if the city and company already exist
    const cityExists = customers.some(customer => customer.city === newCustomer.city);
    const companyExists = customers.some(customer => customer.company === newCustomer.company);

    if (!cityExists || !companyExists) {
      res.status(400).json({ message: 'City and company  already exist !' });
    } else {
      customers.push(newCustomer);
    return  res.status(201).json(newCustomer);
    }
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
