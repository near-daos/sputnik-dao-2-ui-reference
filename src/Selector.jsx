import React, {useEffect, useState} from 'react'
import {Contract} from "near-api-js";

import {
  MDBBadge,
  MDBBox,
  MDBBtn,
  MDBCard,
  MDBCardBody,
  MDBCardHeader,
  MDBIcon,
  MDBInput,
  MDBModal,
  MDBModalBody,
  MDBModalFooter,
  MDBModalHeader,
  MDBCol, MDBContainer, MDBRow, MDBAlert,
} from "mdbreact";
import {useGlobalMutation, useGlobalState} from './utils/container'
import useRouter from "./utils/use-router";
import {Decimal} from "decimal.js";
import {timestampToReadable, yoktoNear} from './utils/funcs'
import Loading from "./utils/Loading";
import * as nearApi from "near-api-js";
import getConfig from "./config";

/* MOVE TO UTILS */
const nearConfig = getConfig(process.env.NODE_ENV || 'development')
const provider = new nearApi.providers.JsonRpcProvider(nearConfig.nodeUrl);
const connection = new nearApi.Connection(nearConfig.nodeUrl, provider, {});

async function accountExists(accountId) {
  try {
    await new nearApi.Account(connection, accountId).state();
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}


const NewDao = (props) => {
  const [showSpinner, setShowSpinner] = useState(false);
  const [showNewDao, setShowNewDao] = useState(true);


  const [daoName, setDaoName] = useState({
    value: "",
    valid: true,
    message: "",
  });

  const [purpose, setPurpose] = useState({
    value: "",
    valid: true,
    message: "",
  });
  const [amount, setAmount] = useState({
    value: "",
    valid: true,
    message: "",
  });
  const [council, setCouncil] = useState({
    value: "",
    valid: true,
    message: "",
  });


  const toggleNewDaoModal = () => {
    setShowNewDao(!showNewDao);
  }


  const submitNewDao = async (e) => {
    e.preventDefault();
    e.persist();
    const nearAccountValid = await accountExists(council.value);

    let validatePurpose = validateField("purpose", purpose.value);
    let validateDaoName = validateField("daoName", daoName.value);
    let validateAmount = validateField("amount", amount.value);

    if (!validateDaoName) {
      e.target.daoName.className += " is-invalid";
      e.target.daoName.classList.remove("is-valid");
    } else {
      e.target.daoName.classList.remove("is-invalid");
      e.target.daoName.className += " is-valid";
    }

    if (!validatePurpose) {
      e.target.purpose.className += " is-invalid";
      e.target.purpose.classList.remove("is-valid");
    } else {
      e.target.purpose.classList.remove("is-invalid");
      e.target.purpose.className += " is-valid";
    }

    if (!validateAmount) {
      e.target.amount.className += " is-invalid";
      e.target.amount.classList.remove("is-valid");
    } else {
      e.target.amount.classList.remove("is-invalid");
      e.target.amount.className += " is-valid";
    }

    if (!nearAccountValid) {
      e.target.council.className += " is-invalid";
      e.target.council.classList.remove("is-valid");
      setCouncil({value: council.value, valid: false, message: 'user account does not exist!'});
    } else {
      setCouncil({value: council.value, valid: true, message: ''});
      e.target.council.classList.remove("is-invalid");
      e.target.council.className += " is-valid";
    }


    if (validatePurpose && validateAmount && nearAccountValid) {

      const argsList = {
        "config": {
          "name": daoName.value,
          "purpose": purpose.value,
          "metadata": "",
        },
        "policy": [council.value],
      }

      //console.log(argsList, Buffer.from(JSON.stringify(argsList)).toString('base64'));

      try {
        setShowSpinner(true);
        const a = new Decimal(amount.value);
        const amountYokto = a.mul(yoktoNear).toFixed();
        const args = Buffer.from(JSON.stringify(argsList)).toString('base64')

        /* Add Public Key until contract is fully tested */
        await window.factoryContract.create({
            "name": daoName.value,
            "public_key": nearConfig.pk,
            "args": args,
          },
          new Decimal("150000000000000").toString(), amountYokto.toString(),
        )
      } catch (e) {
        console.log(e);
        props.setShowError(e);
      } finally {
        setShowSpinner(false);
      }


    }

  }

  const validatePurpose = (field, name, showMessage) => {
    if (name && name.length >= 10 && name.length <= 1280) {
      return true;
    } else {
      showMessage("Please enter between 10 and 1280 chars", 'warning', field);
      return false;
    }
  }

  const validateName = (field, name, showMessage) => {
    const allowedChars = /^(?=[0-9a-zA-Z])(?=.*[0-9a-zA-Z]$)(?!.*__.*)(?!.*--.*)[0-9a-zA-Z_\-]*$/;
    if (name && name.length >= 2 && name.length <= 35 && allowedChars.test(name)) {
      return true;
    } else {
      showMessage("Please enter between 2 and 35 chars, lowercase characters (a-z), digits (0-9),(_-) can be used as separators ", 'warning', field);
      return false;
    }
  }

  const validateAmount = (field, name, showMessage) => {
    if (name && !isNaN(name) && name >= 5) {
      return true;
    } else {
      showMessage("Minimum amount is 5 NEAR", 'warning', field);
      return false;
    }
  }


  const showMessage = (message, type, field) => {
    message = message.trim();
    if (message) {
      switch (field) {
        case "purpose":
          setPurpose({message: message});
          break;
        case "daoName":
          setDaoName({message: message});
          break;
        case "amount":
          setAmount({message: message});
          break;
        case "council":
          setCouncil({message: message});
          break;

      }
    }
  };

  const validateField = (field, value) => {
    switch (field) {
      case "daoName":
        return validateName(field, value, showMessage.bind(this));
      case "purpose":
        return validatePurpose(field, value, showMessage.bind(this));
      case "amount":
        return validateAmount(field, value, showMessage.bind(this));
    }
  };


  const changeHandler = (event) => {
    if (event.target.name === "daoName") {
      setDaoName({value: event.target.value.toLocaleLowerCase(), valid: !!event.target.value});
    }
    if (event.target.name === "purpose") {
      setPurpose({value: event.target.value, valid: !!event.target.value});
    }
    if (event.target.name === "amount") {
      setAmount({value: event.target.value, valid: !!event.target.value});
    }
    if (event.target.name === "council") {
      setCouncil({value: event.target.value.toLowerCase(), valid: !!event.target.value});
    }

    if (event.target.name !== "council") {
      if (!validateField(event.target.name, event.target.value)) {
        event.target.className = "form-control is-invalid";
      } else {
        event.target.className = "form-control is-valid";
      }
    } else {
      if (!validateField(event.target.name, event.target.value)) {
        event.target.className = "form-control is-invalid";
      } else {
        event.target.className = "form-control";
      }
    }
  };


  return (

    <MDBModal isOpen={showNewDao} toggle={() => {
    }} centered position="center" size="lg">
      <MDBModalHeader className="text-center stylish-color white-text" titleClass="w-100 font-weight-bold"
                      toggle={toggleNewDaoModal}>
        Create DAO
      </MDBModalHeader>
      <form className="needs-validation mx-3 grey-text"
            name="newDao"
            noValidate
            method="post"
            onSubmit={submitNewDao}
      >
        <MDBModalBody>

          <MDBInput name="daoName" value={daoName.value}
                    onChange={changeHandler} label="Enter Name (will be prefix of .sputnikdao.near)"
                    required group>
            <div className="invalid-feedback">
              {daoName.message}
            </div>
          </MDBInput>

          <MDBInput name="purpose" value={purpose.value}
                    onChange={changeHandler} label="Enter Purpose"
                    required group>
            <div className="invalid-feedback">
              {purpose.message}
            </div>
          </MDBInput>

          <MDBInput name="council" value={council.value}
                    onChange={changeHandler} label="Enter Council Member"
                    required group>
            <div className="invalid-feedback">
              {council.message}
            </div>
          </MDBInput>

          <MDBInput
            value={amount.value}
            onChange={changeHandler} label="Amount to transfer to the DAO (minimum 5 NEAR for storage)"
            name="amount" group>
            <div className="invalid-feedback">
              {amount.message}
            </div>
          </MDBInput>
        </MDBModalBody>
        <MDBModalFooter className="justify-content-center">
          <MDBBtn color="unique" type="submit">
            Submit
            {showSpinner ?
              <div className="spinner-border spinner-border-sm ml-2" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              : null}
          </MDBBtn>
        </MDBModalFooter>
      </form>
    </MDBModal>


  )


}


async function getDaoState(dao) {
  const nearConfig = getConfig(process.env.NODE_ENV || 'development')
  const provider = new nearApi.providers.JsonRpcProvider(nearConfig.nodeUrl);
  const connection = new nearApi.Connection(nearConfig.nodeUrl, provider, {});
  try {
    const state = await new nearApi.Account(connection, dao).state();
    const amountYokto = new Decimal(state.amount);
    return amountYokto.div(yoktoNear).toFixed(2);
  } catch (error) {
    console.log(error);
    return 0;
  }
}

const DaoInfo = (props) => {
  const contractId = props.item;
  const [council, setCouncil] = useState([]);
  const [daoConfig, setDaoConfig] = useState(null);
  const [daoPolicy, setDaoPolicy] = useState(null);
  const [collapseState, setCollapseState] = useState(false);
  const [daoState, setDaoState] = useState(0);
  const [daoExists, setDaoExists] = useState(true);

  const contract = new Contract(window.walletConnection.account(), contractId, {
    viewMethods: ['get_config', 'get_policy', 'get_staking_contract', 'get_available_amount', 'delegation_total_supply', 'get_last_proposal_id'],
    changeMethods: [],
  })


  useEffect(
    () => {
      if (contractId !== "") {
        accountExists(contractId).then(r => {
          setDaoExists(r);
        }).catch((e) => {
          console.log(e);
        })
      }
    },
    []
  )


  useEffect(
    () => {
      if (contractId !== "") {
        getDaoState(contractId).then(r => {
          setDaoState(r);
        }).catch((e) => {
          console.log(e);
        })
      }
    },
    []
  )

  useEffect(
    () => {
      contract.get_config().then((data) => {
        setDaoConfig(data);
      });
    }, [])

  useEffect(
    () => {
      contract.get_policy().then((data) => {
        setDaoPolicy(data);
      });
    }, [])

  //console.log(daoConfig, daoPolicy)

  const toggleCollapse = () => {
    setCollapseState(!collapseState);
  }


  return (
    <>
      <MDBCard className="m-3" key={props.key} color="grey darken-1"
               style={{
                 borderTopLeftRadius: 25,
                 borderTopRightRadius: 25,
                 borderBottomLeftRadius: 25,
                 borderBottomRightRadius: 25
               }}>
        {daoExists ?
          <MDBCardHeader color="white-text stylish-color" className="h5-responsive"
                         style={{borderTopLeftRadius: 25, borderTopRightRadius: 25}}>
            <div>
              <div className="float-left mt-2">{props.item.replace("." + nearConfig.contractName, "")}</div>
              <div className="float-right h4-responsive">Ⓝ {daoState}</div>
            </div>
          </MDBCardHeader>
          :
          <MDBCardHeader color="white-text stylish-color" className="h5-responsive"
                         style={{borderTopLeftRadius: 25, borderTopRightRadius: 25}}>
            <div>
              <div className="float-left mt-2">DAO removed</div>
            </div>
          </MDBCardHeader>
        }
        <MDBCardBody className="grey darken-1 white-text"
                     style={{borderBottomLeftRadius: 25, borderBottomRightRadius: 25}}>
          <div className="text-left">
            <MDBCard color="special-color-dark" className="mx-auto mb-2">
              <MDBCardBody className="text-left">
                <h6 className="grey-text" color="light">{daoConfig ? daoConfig.purpose : null}</h6>
              </MDBCardBody>
            </MDBCard>
            <div>
              <MDBCard color="special-color-dark" className="mx-auto">
                <MDBCardBody className="text-left">
                  <div className="float-left grey-text">
                    proposal bond <span style={{fontSize: 12}}>{" "}Ⓝ</span>
                  </div>
                  <div className="float-right">
                    {daoPolicy && daoPolicy.proposal_bond !== null ? (new Decimal(daoPolicy.proposal_bond.toString()).div(yoktoNear)).toString() : ''}
                  </div>
                  <div className="clearfix"/>
                  <div className="float-left grey-text">
                    proposal period
                  </div>
                  <div className="float-right">
                    {daoPolicy && daoPolicy.proposal_period !== null ? timestampToReadable(daoPolicy.proposal_period) : ''}
                  </div>
                  <div className="clearfix"/>
                  <div className="float-left grey-text">
                    bounty bond <span style={{fontSize: 12}}>{" "}Ⓝ</span>
                  </div>
                  <div className="float-right">
                    {daoPolicy && daoPolicy.bounty_bond !== null ? (new Decimal(daoPolicy.bounty_bond.toString()).div(yoktoNear)).toString() : ''}
                  </div>
                  <div className="clearfix"/>
                  <div className="float-left grey-text">
                    bounty forgiveness
                  </div>
                  <div className="float-right">
                    {daoPolicy && daoPolicy.bounty_forgiveness_period !== null ? timestampToReadable(daoPolicy.bounty_forgiveness_period) : ''}
                  </div>
                  <div className="clearfix"/>
                </MDBCardBody>
              </MDBCard>
            </div>
            <hr/>
            {daoExists ?
              <>
                <div className="float-left">
                  <MDBBtn
                    color="elegant"
                    size="sm"
                    onClick={toggleCollapse}
                  >
                    council{" "}
                    <MDBIcon icon={!collapseState ? "arrow-down" : "arrow-up"}/>
                  </MDBBtn>
                </div>
                <div className="float-right">
                  <MDBBtn name={props.item} onClick={props.handleSelect} color="elegant" size="sm"
                          className="float-right">SELECT</MDBBtn>
                </div>
                <div className="clearfix"/>
              </>
              : null}
          </div>
          {collapseState ?
            <div>
              <hr/>
              <MDBCol>
                {daoPolicy && daoPolicy.roles[1] && daoPolicy.roles[1].kind.Group ? daoPolicy.roles[1].kind.Group.map((item, key) => <div className="text-right" key={key}>{item}</div>): null}
                {daoPolicy && daoPolicy.roles[0] && daoPolicy.roles[0].kind.Group ? daoPolicy.roles[0].kind.Group.map((item, key) => <div className="text-right" key={key}>{item}</div>): null}
              </MDBCol>
            </div>
            : null}
        </MDBCardBody>
      </MDBCard>
    </>


  );
}

const Selector = (props) => {
  const routerCtx = useRouter()
  const stateCtx = useGlobalState()
  const mutationCtx = useGlobalMutation()
  const [daoList, setDaoList] = useState([]);
  const [daoListFixed, setDaoListFixed] = useState([]);
  const [showNewDaoModal, setShowNewDaoModal] = useState(false);
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
      window.factoryContract.get_dao_list()
        .then(r => {
          setDaoList(r);
          setShowLoading(false);
        }).catch((e) => {
        setShowLoading(false);
        console.log(e);
        mutationCtx.toastError(e);
      })
    },
    []
  )

  const handleSelect = async (e) => {
    e.preventDefault();
    mutationCtx.updateConfig({
      contract: e.target.name,
      bond: '',
      purpose: '',
      votePeriod: '',
      lastShownProposal: 0,
      lastJsonData: 0,
    });
    props.setSelectDao(false);
    routerCtx.history.push('/' + e.target.name);
    window.location.reload();
    return false;
  }

  const toggleNewDao = () => {
    setShowNewDaoModal(!showNewDaoModal);
  }

  /*
  useEffect(() => {
      daoList.map(async (item, key) => {
        console.log(key)
        if (await accountExists(item)) {
          setDaoListFixed(prevState => ([...prevState, {key: key, dao: item}]));
        }
      })
      setShowLoading(false)
    },
    [daoList]
  )
   */


  return (
    <div>
      <MDBCard className="p-md-3 m-md-3 stylish-color-dark">
        <MDBCardHeader className="text-center white-text" titleClass="w-100" tag="p">
          Please select or create DAO
          <hr color="white"/>
          <MDBBtn color="grey" disabled={!window.walletConnection.getAccountId()} onClick={toggleNewDao}
                  className="">CREATE NEW DAO</MDBBtn>
          <MDBBox className="white-text text-center">Attention! Required minimum 5 NEAR for the storage.</MDBBox>
        </MDBCardHeader>
        {showLoading ? <Loading/> : null}
        <MDBCardBody className="text-center">
          <MDBRow>
            {!showLoading && daoList ? daoList.map((item, key) => (
              <MDBCol lg="6" md="12">
                <DaoInfo item={item} key={key} handleSelect={handleSelect}/>
              </MDBCol>
            )) : null}
          </MDBRow>
        </MDBCardBody>
      </MDBCard>
      {showNewDaoModal ?
        <NewDao setShowError={props.setShowError} toggleNewDao={toggleNewDao}/>
        : null}
    </div>

  )
}

export default Selector;
