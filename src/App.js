import { Card, CardContent, FormControl, FormGroup, MenuItem, Select} from '@material-ui/core';
import React, { useEffect, useState } from 'react';

import './App.css';
import InfoBox from './InfoBox';
import LineGraph from './LineGraph';
import Map from './Map';
import Table from './Table';
import {sortData,prettyPrintStat} from './utile'
import "leaflet/dist/leaflet.css";
import numeral from 'numeral'

function App() {
  const[countries,setCountries]=useState([]);
  const [country, setCountry] = useState('worldwide');
  const [countryInfo, setCountryInfo] = useState({});
  const [mapCountries, setMapCountries] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [casesType, setCasesType] = useState("cases");


  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      });
  }, []);

  useEffect(() => {
    const getCountriesData =async()=>{
      await fetch("https://disease.sh/v3/covid-19/countries")
      .then ((response) => response.json())
      .then((data) =>{
        const countries = data.map((country) =>(
          {
            name: country.country,
            value : country.countryInfo.iso2
          }
        ));
        let sortedData = sortData(data);
        setCountries(countries);
        setMapCountries(data);
        setTableData(sortedData);
      })
    };
    // return () => {
    //   cleanup
    // }
    getCountriesData();
  }, [])
  const onCountryChange= async(event) =>{
    const countryCode=event.target.value;
    
    setCountry(countryCode);
    const url =countryCode === 'worldwide' 
    ? 'https://disease.sh/v3/covid-19/all'
    :`https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
    .then(response => response.json())
    .then (data => {
      setCountry(countryCode);
      setCountryInfo(data);
      setMapCenter([data.countryInfo.lat,  data.countryInfo.long])
      setMapZoom(4);
    });
  };
  
  return (
    <div className="app">
      <div className="app_left">
      <div className="app_header">
        <h1>Covid-19 Trac
        ker</h1>
          <FormControl className="app-dropdown">
            <Select 
            onChange={onCountryChange}
            variant="outlined"
            value={country}>
            <MenuItem value="worldwide">Worldwide</MenuItem>

            {
              countries.map((country)=>(
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))
            }
              {/* <MenuItem value="worldwide">Worldwide</MenuItem>
              <MenuItem value="worldwide">Worldwide</MenuItem>
              <MenuItem value="worldwide">Worldwide</MenuItem>
              <MenuItem value="worldwide">Worldwide</MenuItem> */}
            </Select>
          </FormControl>
      </div>

      <div className="app_stats">
      <InfoBox
            onClick={(e) => setCasesType("cases")}
            title="Coronavirus Cases"
            isRed
            active={casesType === "cases"}
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={numeral(countryInfo.cases).format("0.0a")}
          />
          <InfoBox
            onClick={(e) => setCasesType("recovered")}
            title="Recovered"
            active={casesType === "recovered"}
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={numeral(countryInfo.recovered).format("0.0a")}
          />
          <InfoBox
            onClick={(e) => setCasesType("deaths")}
            title="Deaths"
            isRed
            active={casesType === "deaths"}
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={numeral(countryInfo.deaths).format("0.0a")}
          />
      </div>
      <Map
          countries={mapCountries}
          casesType={casesType}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>

    <Card className="app_right">
     <CardContent>
        <h3>Live cases</h3>
        <Table countries={tableData}/>
        <h3>Worldwide new {casesType}</h3>
        <LineGraph casesType={casesType}/>
    </CardContent>

    </Card>
    </div>
  );
}

export default App;
