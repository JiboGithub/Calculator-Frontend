import { Component } from '@angular/core';
import axios from 'axios';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title: string = "Habeeb's Calculator"
  view: string = "calc"

  baseAPI: string = "https://devjibs.bsite.net/api"

  appLoading: boolean = true;
  opLoading: boolean = false;
  historyLoading: boolean = false;

  userID: string | null = null;
  calcHistory: any = [];

  values: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
  operators = [
    { label: "+", value: 1 },
    { label: "-", value: 2 },
    { label: "x", value: 3 },
    { label: "/", value: 4 }
  ];

  firstValue: string = "";
  secondValue: string = "";
  operator: any = {label: "", value: ""};
  operationResult: string = "";

  ngOnInit() { this.initialize() }

  initialize = async () => {
    const savedID = localStorage.getItem("HCUserID")
    if (savedID) {
      this.userID = savedID;
      setTimeout(() => { this.appLoading = false }, 3000)
    }
    else {
      const result = (await axios.post(`${this.baseAPI}/users/createuser`)).data;
      if (result.status) {
        this.userID = result.responseData.id;
        localStorage.setItem("HCUserID", result.responseData.id);
        this.appLoading = false;
      }
    }
  }

  toggleHistory = () => {
    if (this.view === "calc") {
      this.fetchHistory();
      this.view = "history";
    }
    else this.view = "calc"
  }

  setValue = (value: number) => {
    if (this.operationResult) this.clearOperation()
    if (this.operator.value) this.secondValue += String(value);
    else this.firstValue += String(value);
  }

  setOperator = (operator: any) => {
    if (!this.firstValue) return;
    this.operator = operator;
  }

  getOperator = (opValue: number) => {
    const operator = this.operators.find((op: any) => op.value === opValue);
    return operator?.value;
  }

  deleteValue = () => {
    if (this.operationResult) { this.clearOperation(); return; }
    if (this.secondValue) this.secondValue = this.secondValue.slice(0, -1);
    else if (this.operator.value) this.operator = { label: "", value: "" };
    else this.firstValue = this.firstValue.slice(0, -1);
  }

  clearOperation = () => {
    this.firstValue = ""
    this.secondValue = ""
    this.operator = { label: "", value: "" }
    this.operationResult = ""
  }

  calculate = async () => {
    this.opLoading = true;
    const result = (await axios.post(`${this.baseAPI}/calculator/perform-calculation`, {
      userID: this.userID,
      firstValue: this.firstValue,
      operationType: this.operator.value,
      secondValue: this.secondValue
    })).data;
    this.opLoading = false;

    if (result.status) {
      this.operationResult = result.responseData.result;
    }
  };

  fetchHistory = async () => {
    this.historyLoading = true;
    const result = (await axios.get(`${this.baseAPI}/calculator/history/${this.userID}`)).data;
    this.historyLoading = false;

    if (result.status) {
      this.calcHistory = result.responseData;
    }
  }
}
