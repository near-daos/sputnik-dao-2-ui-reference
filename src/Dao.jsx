import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import useRouter from "./utils/use-router";
import { useParams } from "react-router-dom";
import roketoLogoSvg from "./assets/roketo-logo.svg";
import nearSocialLogoSvg from "./assets/near-social.svg";
import {
  MDBBox,
  MDBBtn,
  MDBCard,
  MDBCardBody,
  MDBCardHeader,
  MDBCol,
  MDBContainer,
  MDBInput,
  MDBMask,
  MDBModal,
  MDBModalBody,
  MDBModalFooter,
  MDBModalHeader,
  MDBNotification,
  MDBRow,
  MDBView,
  MDBIcon,
  MDBLink,
  MDBAlert,
} from "mdbreact";
import { useGlobalMutation, useGlobalState } from "./utils/container";
import { Decimal } from "decimal.js";
import Selector from "./Selector";
import {
  convertDuration,
  proposalsReload,
  timestampToReadable,
  updatesJsonUrl,
  yoktoNear,
  parseForumUrl,
} from "./utils/funcs";
import getConfig from "./config";
import * as nearApi from "near-api-js";
import { Contract } from "near-api-js";
import { Proposal } from "./ProposalPage";
import Loading from "./utils/Loading";
import MarkdownIt from "markdown-it";
import MdEditor from "react-markdown-editor-lite";
// import style manually
import "react-markdown-editor-lite/lib/index.css";
import { async } from "regenerator-runtime";

const Dao = () => {
  const routerCtx = useRouter();
  const stateCtx = useGlobalState();
  const mutationCtx = useGlobalMutation();
  const [numberProposals, setNumberProposals] = useState(0);
  const [proposals, setProposals] = useState(null);
  const [showError, setShowError] = useState(null);
  const [addProposalModal, setAddProposalModal] = useState(false);
  const [newProposalCouncilMember, setNewProposalCouncilMember] =
    useState(false);
  const [removeProposalCouncilMember, setRemoveProposalCouncilMember] =
    useState(false);
  const [newProposalPayout, setNewProposalPayout] = useState(false);
  const [newProposalToken, setNewProposalToken] = useState(false);
  const [newProposalRoketoStream, setNewProposalRoketoStream] = useState(false);
  const [newProposalCustomCall, setNewProposalCustomCall] = useState(false);
  const [newProposalNearSocialPost, setNewProposalNearSocialPost] =
    useState(false);
  const mdParser = new MarkdownIt({
    html: true,
    typographer: false,
    breaks: true,
    linkify: true,
  });
  const [selectDao, setSelectDao] = useState(false);
  const [showNewProposalNotification, setShowNewProposalNotification] =
    useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const [daoState, setDaoState] = useState(0);
  const [daoConfig, setDaoConfig] = useState(null);
  const [daoPolicy, setDaoPolicy] = useState(null);
  const [daoStaking, setDaoStaking] = useState(null);
  const [disableTarget, setDisableTarget] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);

  const nearConfig = getConfig(process.env.NODE_ENV || "development");
  const provider = new nearApi.providers.JsonRpcProvider(nearConfig.nodeUrl);
  const connection = new nearApi.Connection(nearConfig.nodeUrl, provider, {});

  const [proposalToken, setProposalToken] = useState({
    ownerId: null,
    totalSupply: null,
    name: null,
    symbol: null,
    icon: null,
    decimals: null,
  });

  const [proposalTokenOwner, setProposalTokenOwner] = useState({
    value: "",
    valid: true,
    message: "",
  });

  const [proposalTokenSupply, setProposalTokenSupply] = useState({
    value: "",
    valid: true,
    message: "",
  });

  const [proposalTokenName, setProposalTokenName] = useState({
    value: "",
    valid: true,
    message: "",
  });

  const [proposalTokenSymbol, setProposalTokenSymbol] = useState({
    value: "",
    valid: true,
    message: "",
  });

  const [proposalTokenIcon, setProposalTokenIcon] = useState({
    value: "",
    valid: true,
    message: "",
  });

  const [proposalTokenDecimals, setProposalTokenDecimals] = useState({
    value: "18",
    valid: true,
    message: "",
  });

  const [proposalCustomMethodName, setProposalCustomMethodName] = useState({
    value: "",
    valid: true,
    message: "",
  });

  const [proposalCustomDeposit, setProposalCustomDeposit] = useState({
    value: "",
    valid: true,
    message: "",
  });

  const [proposalCustomArgs, setProposalCustomArgs] = useState({
    value: "",
    valid: true,
    message: "",
  });

  const [proposalKind, setProposalKind] = useState({
    value: "",
    valid: true,
    message: "",
  });
  const [proposalTarget, setProposalTarget] = useState({
    value: "",
    valid: true,
    message: "",
  });
  const [proposalDescription, setProposalDescription] = useState({
    value: "",
    valid: true,
    message: "",
  });
  const [proposalDiscussion, setProposalDiscussion] = useState({
    value: "",
    valid: true,
    message: "",
  });
  const [proposalAmount, setProposalAmount] = useState({
    value: "",
    valid: true,
    message: "",
  });
  const [proposalRoketoSpeed, setProposalRoketoSpeed] = useState({
    value: "",
    valid: true,
    message: "",
  });
  const [proposalFT, setProposalFT] = useState({
    value: "",
    valid: true,
    message: "",
  });
  const [votePeriod, setVotePeriod] = useState({
    value: "",
    valid: true,
    message: "",
  });
  const [changePurpose, setChangePurpose] = useState({
    value: "",
    valid: true,
    message: "",
  });
  const [paymentOption, setPaymentOption] = useState("NEAR");

  let { dao } = useParams();

  useEffect(() => {
    if (stateCtx.config.contract === "") {
      if (dao !== undefined) {
        mutationCtx.updateConfig({
          contract: dao,
        });
      } else {
        setSelectDao(true);
      }
    } else {
      window.contract = new Contract(
        window.walletConnection.account(),
        stateCtx.config.contract,
        {
          viewMethods: [
            "get_config",
            "get_policy",
            "get_staking_contract",
            "get_available_amount",
            "delegation_total_supply",
            "get_proposals",
            "get_last_proposal_id",
            "get_proposal",
            "get_bounty",
            "get_bounties",
            "get_last_bounty_id",
            "get_bounty_claims",
            "get_bounty_number_of_claims",
            "delegation_balance_of",
            "has_blob",
          ],
          changeMethods: ["add_proposal", "act_proposal"],
        }
      );
    }
  }, [stateCtx.config.contract]);

  useEffect(() => {
    if (
      stateCtx.config.contract !== "" &&
      dao !== stateCtx.config.contract &&
      dao !== undefined
    ) {
      mutationCtx.updateConfig({
        contract: "",
      });
      location.reload();
    }
  }, [stateCtx.config.contract]);

  useEffect(() => {
    if (stateCtx.config.contract !== "") {
      window.contract
        .get_policy()
        .then((r) => {
          setDaoPolicy(r);
        })
        .catch((e) => {
          console.log(e);
          setShowError(e);
        });
    }
  }, [stateCtx.config.contract]);

  useEffect(() => {
    if (stateCtx.config.contract !== "") {
      window.contract
        .get_config()
        .then((r) => {
          setDaoConfig(r);
        })
        .catch((e) => {
          console.log(e);
          setShowError(e);
        });
    }
  }, [stateCtx.config.contract]);

  useEffect(() => {
    if (stateCtx.config.contract !== "") {
      window.contract
        .get_staking_contract()
        .then((r) => {
          setDaoStaking(r);
        })
        .catch((e) => {
          console.log(e);
          setShowError(e);
        });
    }
  }, [stateCtx.config.contract]);

  const toggleProposalModal = () => {
    setAddProposalModal(!addProposalModal);
  };

  const toggleNewCouncilMember = () => {
    setNewProposalCouncilMember(!newProposalCouncilMember);
    setAddProposalModal(false);
  };

  const toggleRemoveCouncilMember = () => {
    setRemoveProposalCouncilMember(!removeProposalCouncilMember);
    setAddProposalModal(false);
  };

  const toggleNewPayout = () => {
    setNewProposalPayout(!newProposalPayout);
    setAddProposalModal(false);
  };

  const toggleNewToken = () => {
    setProposalTarget({
      value: nearConfig.tokenFactory,
      valid: true,
      message: "",
    });
    setProposalTokenOwner({
      value: stateCtx.config.contract,
      valid: true,
      message: "",
    });

    setNewProposalToken(!newProposalToken);
    setAddProposalModal(false);
  };

  const toggleCustomCall = () => {
    setNewProposalCustomCall(!newProposalCustomCall);
    setAddProposalModal(false);
  };

  const toggleNearSocialPost = () => {
    setNewProposalNearSocialPost(!newProposalNearSocialPost);
    setAddProposalModal(false);
  };

  const toggleRoketoStream = () => {
    setNewProposalRoketoStream(!newProposalRoketoStream);
    setAddProposalModal(false);
  };

  async function accountExists(accountId) {
    try {
      await new nearApi.Account(connection, accountId).state();
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async function getDaoState(dao) {
    try {
      const state = await new nearApi.Account(connection, dao).state();
      const amountYokto = new Decimal(state.amount);
      return amountYokto.div(yoktoNear).toFixed(2);
    } catch (error) {
      console.log(error);
      return 0;
    }
  }

  const [firstRun, setFirstRun] = useState(true);

  async function getProposals() {
    let limit = 100;
    let fromIndex = 0;
    const numberProposals = await window.contract.get_last_proposal_id();
    setNumberProposals(numberProposals);
    mutationCtx.updateConfig({
      lastShownProposal: numberProposals,
    });
    let proposals = [];
    if (numberProposals > 100) {
      let pages = new Decimal(numberProposals / limit).toFixed(0);
      let i;
      for (i = 0; i <= pages; i++) {
        fromIndex = limit * i;
        let proposals2;
        try {
          proposals2 = await window.contract.get_proposals({
            from_index: fromIndex,
            limit: limit,
          });
        } catch (e) {
          console.log(e);
        }
        Array.prototype.push.apply(proposals, proposals2);
      }
    } else {
      proposals = await window.contract.get_proposals({
        from_index: fromIndex,
        limit: limit,
      });
    }

    const t = [];
    proposals.map((item, key) => {
      const t2 = {};
      Object.assign(t2, { key: key }, item);
      t.push(t2);
    });

    return t;
  }

  useEffect(async () => {
    if (!firstRun) {
      const interval = setInterval(async () => {
        console.log("loading proposals");
        getProposals().then((r) => {
          setProposals(r);
          setShowLoading(false);
        });
      }, proposalsReload);
      return () => clearInterval(interval);
    } else {
      getProposals().then((r) => {
        setProposals(r);
        setShowLoading(false);
      });
      setFirstRun(false);
    }
  }, [stateCtx.config.contract, firstRun]);

  useEffect(() => {
    if (stateCtx.config.contract !== "") {
      getDaoState(stateCtx.config.contract)
        .then((r) => {
          setDaoState(r);
        })
        .catch((e) => {
          console.log(e);
          setShowError(e);
        });
    }
  }, [stateCtx.config.contract]);

  const handleDaoChange = () => {
    mutationCtx.updateConfig({
      contract: "",
    });
    routerCtx.history.push("/");
  };

  const validateString = (field, name, showMessage) => {
    if (name && name.length >= 1) {
      return true;
    } else {
      showMessage(field + " > 1 chars", "warning", field);
      return false;
    }
  };
  const validateLongString = (field, name, showMessage) => {
    if (name && name.length >= 2 && name.length <= 4024) {
      return true;
    } else {
      showMessage("> 2 and < 4024 chars", "warning", field);
      return false;
    }
  };

  const validateProposalDiscussion = (field, name, showMessage) => {
    let categories = parseForumUrl(name);
    /* Hardcoded exclusion of rucommunity.sputnikdao.near from field validation */
    if (
      categories === name &&
      stateCtx.config.contract !== "rucommunity.sputnikdao.near"
    ) {
      showMessage("Wrong link format", "warning", field);
      return false;
    } else {
      return true;
    }
  };

  const validateNumber = (field, name, showMessage) => {
    if (name && !isNaN(name) && name.length > 0) {
      return true;
    } else {
      showMessage("Please enter number", "warning", field);
      return false;
    }
  };

  const validateDecimals = (field, name, showMessage) => {
    if (name && !isNaN(name) && name > 0 && name <= 24) {
      return true;
    } else {
      showMessage("Please enter number between 1 and 24", "warning", field);
      return false;
    }
  };

  const validateTokenSupply = (field, name, showMessage) => {
    if (
      name &&
      !isNaN(name) &&
      name > 0 &&
      name < 100000000000000000000000000000
    ) {
      return true;
    } else {
      showMessage(
        "Enter number between 1 and 10e30 (Maximum total supply u128)",
        "warning",
        field
      );
      return false;
    }
  };

  const validateField = (field, value) => {
    switch (field) {
      case "proposalKind":
        return value !== "false";
      case "proposalTarget":
      case "changePurpose":
      case "proposalFT":
        return validateString(field, value, showMessage.bind(this));
      case "proposalDescription":
        return validateLongString(field, value, showMessage.bind(this));
      case "proposalTokenOwner":
        return validateString(field, value, showMessage.bind(this));
      case "proposalTokenSupply":
        return validateTokenSupply(field, value, showMessage.bind(this));
      case "proposalTokenName":
        return validateString(field, value, showMessage.bind(this));
      case "proposalTokenSymbol":
        return validateString(field, value, showMessage.bind(this));
      case "proposalTokenIcon":
        return validateString(field, value, showMessage.bind(this));
      case "proposalTokenDecimals":
        return validateDecimals(field, value, showMessage.bind(this));
      case "proposalCustomMethodName":
        return validateString(field, value, showMessage.bind(this));
      case "proposalCustomDeposit":
        return validateDecimals(field, value, showMessage.bind(this));
      case "proposalCustomArgs":
        return validateLongString(field, value, showMessage.bind(this));
      case "proposalDiscussion":
        return validateProposalDiscussion(field, value, showMessage.bind(this));
      case "proposalAmount":
      case "proposalRoketoSpeed":
      case "votePeriod":
        return validateNumber(field, value, showMessage.bind(this));
    }
  };

  function handleEditorChange(event) {
    setProposalCustomArgs({
      value: JSON.stringify({
        post: { main: { type: "md", text: event.text } },
        index: { post: { key: "main", value: { type: "md" } } },
      }),
      valid: !!event.text,
      message: proposalCustomArgs.message,
    });
  }

  const ipfsUpload = async (f) => {
    const formData = new FormData();

    formData.append("file", f);
    const res = await fetch("https://ipfs.near.social/add", {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: f,
    });
    return (await res.json()).cid;
  };

  const ipfsUrl = (cid) => `https://ipfs.near.social/ipfs/${cid}`;

  const handleEditorImageUpload = async (file) => {
    console.log(file);
    const img = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (data) => {
        resolve(data.target.result);
      };
      reader.readAsDataURL(file);
    });
    console.log("img", img);
    const cid = await ipfsUpload(file);
    return ipfsUrl(cid);
  };

  const changeHandler = (event) => {
    if (event.target.name === "proposalTarget") {
      setProposalTarget({
        value: event.target.value.toLowerCase(),
        valid: !!event.target.value,
        message: proposalTarget.message,
      });
    }

    if (event.target.name === "proposalTokenOwner") {
      setProposalTokenOwner({
        value: event.target.value.toLowerCase(),
        valid: !!event.target.value,
        message: proposalTokenOwner.message,
      });
    }

    if (event.target.name === "proposalTokenSupply") {
      setProposalTokenSupply({
        value: event.target.value,
        valid: !!event.target.value,
        message: proposalTokenSupply.message,
      });
    }

    if (event.target.name === "proposalTokenName") {
      setProposalTokenName({
        value: event.target.value,
        valid: !!event.target.value,
        message: proposalTokenName.message,
      });
    }

    if (event.target.name === "proposalTokenSymbol") {
      setProposalTokenSymbol({
        value: event.target.value,
        valid: !!event.target.value,
        message: proposalTokenSymbol.message,
      });
    }

    if (event.target.name === "proposalTokenIcon") {
      setProposalTokenIcon({
        value: event.target.value.toLowerCase(),
        valid: !!event.target.value,
        message: proposalTokenIcon.message,
      });
    }

    if (event.target.name === "proposalTokenDecimals") {
      setProposalTokenDecimals({
        value: event.target.value.toLowerCase(),
        valid: !!event.target.value,
        message: proposalTokenDecimals.message,
      });
    }

    if (event.target.name === "proposalCustomMethodName") {
      setProposalCustomMethodName({
        value: event.target.value.toLowerCase(),
        valid: !!event.target.value,
        message: proposalCustomMethodName.message,
      });
    }

    if (event.target.name === "proposalCustomDeposit") {
      setProposalCustomDeposit({
        value: event.target.value.toLowerCase(),
        valid: !!event.target.value,
        message: proposalCustomDeposit.message,
      });
    }

    if (event.target.name === "proposalCustomArgs") {
      setProposalCustomArgs({
        value: event.target.value,
        valid: !!event.target.value,
        message: proposalCustomArgs.message,
      });
    }

    if (event.target.name === "proposalDescription") {
      setProposalDescription({
        value: event.target.value,
        valid: !!event.target.value,
        message: proposalDescription.message,
      });
    }
    if (event.target.name === "proposalDiscussion") {
      setProposalDiscussion({
        value: event.target.value,
        valid: !!event.target.value,
        message: proposalDiscussion.message,
      });
    }
    if (event.target.name === "proposalAmount") {
      setProposalAmount({
        value: event.target.value,
        valid: !!event.target.value,
        message: proposalAmount.message,
      });
    }
    if (event.target.name === "proposalRoketoSpeed") {
      setProposalRoketoSpeed({
        value: event.target.value,
        valid: !!event.target.value,
        message: proposalAmount.message,
      });
    }
    if (event.target.name === "proposalFT") {
      setProposalFT({
        value: event.target.value,
        valid: !!event.target.value,
        message: proposalFT.message,
      });
    }
    if (event.target.name === "votePeriod") {
      setVotePeriod({
        value: event.target.value,
        valid: !!event.target.value,
        message: votePeriod.message,
      });
    }
    if (event.target.name === "changePurpose") {
      setChangePurpose({
        value: event.target.value,
        valid: !!event.target.value,
        message: changePurpose.message,
      });
    }

    if (!validateField(event.target.name, event.target.value)) {
      event.target.className = "form-control is-invalid";
    } else {
      event.target.className = "form-control is-valid";
    }
  };

  const showMessage = (message, type, field) => {
    message = message.trim();
    if (message) {
      switch (field) {
        case "proposalKind":
          setProposalKind((prevState) => ({ ...prevState, message: message }));
          break;
        case "proposalTarget":
          setProposalTarget((prevState) => ({
            ...prevState,
            message: message,
          }));
          break;
        case "proposalDescription":
          setProposalDescription((prevState) => ({
            ...prevState,
            message: message,
          }));
          break;
        case "proposalFT":
          setProposalFT((prevState) => ({ ...prevState, message: message }));
          break;
        case "proposalTokenOwner":
          setProposalTokenOwner((prevState) => ({
            ...prevState,
            message: message,
          }));
          break;
        case "proposalTokenSupply":
          setProposalTokenSupply((prevState) => ({
            ...prevState,
            message: message,
          }));
          break;
        case "proposalTokenName":
          setProposalTokenName((prevState) => ({
            ...prevState,
            message: message,
          }));
          break;
        case "proposalTokenSymbol":
          setProposalTokenSymbol((prevState) => ({
            ...prevState,
            message: message,
          }));
          break;
        case "proposalTokenIcon":
          setProposalTokenIcon((prevState) => ({
            ...prevState,
            message: message,
          }));
          break;
        case "proposalTokenDecimals":
          setProposalTokenDecimals((prevState) => ({
            ...prevState,
            message: message,
          }));
          break;
        case "proposalCustomMethodName":
          setProposalCustomMethodName((prevState) => ({
            ...prevState,
            message: message,
          }));
          break;
        case "proposalCustomDeposit":
          setProposalCustomDeposit((prevState) => ({
            ...prevState,
            message: message,
          }));
          break;
        case "proposalCustomArgs":
          setProposalCustomArgs((prevState) => ({
            ...prevState,
            message: message,
          }));
          break;
        case "proposalDiscussion":
          setProposalDiscussion((prevState) => ({
            ...prevState,
            message: message,
          }));
          break;
        case "proposalAmount":
          setProposalAmount((prevState) => ({
            ...prevState,
            message: message,
          }));
          break;
      }
    }
  };

  const [switchState, setSwitchState] = useState({
    switchAll: stateCtx.config.filter.switchAll,
    switchInProgress: stateCtx.config.filter.switchInProgress,
    switchDone: stateCtx.config.filter.switchDone,
    switchNew: stateCtx.config.filter.switchNew,
    switchExpired: stateCtx.config.filter.switchExpired,
  });

  const handleSwitchChange = (switchName) => () => {
    let switched = {};
    switch (switchName) {
      case "switchAll":
        switched = {
          switchAll: !switchState.switchAll,
          switchInProgress: false,
          switchDone: false,
          switchNew: false,
          switchExpired: false,
        };
        break;

      case "switchInProgress":
        switched = {
          switchAll: false,
          switchInProgress: !switchState.switchInProgress,
          switchDone: switchState.switchDone,
          switchNew: false,
          switchExpired: false,
        };
        break;

      case "switchDone":
        switched = {
          switchAll: false,
          switchInProgress: switchState.switchInProgress,
          switchDone: !switchState.switchDone,
          switchNew: false,
          switchExpired: false,
        };
        break;

      case "switchNew":
        switched = {
          switchAll: false,
          switchInProgress: false,
          switchDone: false,
          switchNew: !switchState.switchNew,
          switchExpired: false,
        };
        break;

      case "switchExpired":
        switched = {
          switchAll: false,
          switchInProgress: false,
          switchDone: false,
          switchNew: false,
          switchExpired: !switchState.switchExpired,
        };
        break;

      default:
        switched = {
          switchAll: true,
          switchInProgress: false,
          switchDone: false,
          switchNew: false,
        };
        break;
    }
    setSwitchState(switched);
    mutationCtx.updateConfig({ filter: switched });
  };

  const detectLink = (string) => {
    let urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;

    if (!urlRegex.test(string)) {
      return false;
    } else {
      console.log(string.match(urlRegex));
      return string.match(urlRegex);
    }
  };
  const submitProposal = async (e) => {
    e.preventDefault();
    e.persist();

    // Handle roketo stream creation
    if (e.target.name === "newProposalRoketoStream") {
      // const argsList = {
      //   args: {
      //     owner_id: e.target.proposalTokenOwner.value.trim(),
      //     total_supply: new Decimal(e.target.proposalTokenSupply.value.trim()).mul(new Decimal(10).pow(e.target.proposalTokenDecimals.value)).round(0, 0).toFixed(0),
      //     metadata: {
      //       spec: "ft-1.0.0",
      //       name: e.target.proposalTokenName.value.trim(),
      //       symbol: e.target.proposalTokenSymbol.value.trim(),
      //       icon: e.target.proposalTokenIcon.value.trim(),
      //       decimals: '^' + e.target.proposalTokenDecimals.value + '^',
      //     },
      //   },
      // }
      const nearAccountValid = await accountExists(proposalTarget.value);
      let validateTarget = validateField(
        "proposalTarget",
        proposalTarget.value
      );
      let validateDescription = validateField(
        "proposalDescription",
        proposalDescription.value
      );
      let validateSpeed = validateField(
        "proposalRoketoSpeed",
        proposalRoketoSpeed.value
      );

      let validatePaymentOption = true;
      if (paymentOption === "FT") {
        validatePaymentOption = validateField(
          "proposalFT",
          e.target.proposalFT.value
        );
      }

      let ftMetadata = null;
      if (paymentOption === "FT") {
        try {
          const tokenContract = new Contract(
            window.walletConnection.account(),
            e.target.proposalFT.value,
            {
              viewMethods: ["ft_metadata"],
              changeMethods: [],
            }
          );
          ftMetadata = await tokenContract.ft_metadata({});
        } catch (error) {
          // nu vse
          console.log(error);
        }
      }

      if (
        (validateTarget &&
          nearAccountValid &&
          validateDescription &&
          validateSpeed &&
          validatePaymentOption &&
          paymentOption === "FT" &&
          ftMetadata) ||
        (paymentOption === "NEAR" && !ftMetadata)
      ) {
        const amount = new Decimal(e.target.proposalAmount.value);

        const isFt = paymentOption === "FT";
        const tokenDecimals = isFt ? ftMetadata.decimals : 24;

        // tokens per second => tokens per tick
        const tpsToTpt = (speed) => {
          const nanosecPower = 9;
          return new Decimal(speed)
            .mul(Math.pow(10, tokenDecimals - nanosecPower))
            .divToInt(1);
        };

        const speedPerTick = tpsToTpt(e.target.proposalRoketoSpeed.value);
        if (speedPerTick.toFixed() === "0") {
          throw new Error("This token is not supported");
        }

        const roketoContractAddress = nearConfig.roketoContractAddress;

        const bufferizeArgs = (args) =>
          Buffer.from(
            JSON.stringify(args).replaceAll('^"', "").replaceAll('"^', "")
          ).toString("base64");

        try {
          setShowSpinner(true);
          if (isFt) {
            // Handle fungible-tokens streams
            const tokenContractAddress = e.target.proposalFT.value;
            const amountTokens = amount
              .mul("1e" + ftMetadata.decimals)
              .toFixed();

            await window.contract.add_proposal(
              {
                proposal: {
                  description: e.target.proposalDescription.value.trim(),
                  kind: {
                    FunctionCall: {
                      receiver_id: tokenContractAddress,
                      actions: [
                        {
                          method_name: "ft_transfer_call",
                          args: bufferizeArgs({
                            receiver_id: roketoContractAddress,
                            amount: amountTokens,
                            memo: "Sputnik-Roketo transfer",
                            msg: JSON.stringify({
                              Create: {
                                description:
                                  e.target.proposalDescription.value.trim(),
                                owner_id: stateCtx.config.contract,
                                receiver_id: e.target.proposalTarget.value,
                                token_name: "DACHA",
                                tokens_per_tick: speedPerTick.toFixed(),
                                balance: amountTokens,
                                is_auto_start_enabled: true,
                                is_auto_deposit_enabled: false,
                              },
                            }),
                          }),
                          deposit: "1",
                          gas: "150000000000000",
                        },
                      ],
                    },
                  },
                },
              },
              new Decimal("30000000000000").toString(),
              daoPolicy.proposal_bond.toString()
            );
          } else {
            const amountYokto = amount.mul(yoktoNear).toFixed();
            // Handle case of NEAR streams
            await window.contract.add_proposal(
              {
                proposal: {
                  description: e.target.proposalDescription.value.trim(),
                  kind: {
                    FunctionCall: {
                      receiver_id: roketoContractAddress,
                      actions: [
                        {
                          method_name: "create_stream",
                          args: bufferizeArgs({
                            description:
                              e.target.proposalDescription.value.trim(),
                            receiver_id: e.target.proposalTarget.value,
                            tokens_per_tick: speedPerTick.toFixed(),
                            is_auto_start_enabled: true,
                            is_auto_deposit_enabled: false,
                          }),
                          deposit: amountYokto,
                          gas: "150000000000000",
                        },
                      ],
                    },
                  },
                },
              },
              new Decimal("30000000000000").toString(),
              daoPolicy.proposal_bond.toString()
            );
          }
        } catch (e) {
          console.log(e);
          setShowError(e);
        } finally {
          setShowSpinner(false);
        }
      }
    }

    {
      /* --------------------------------------------------------------------------------------------------- */
    }
    {
      /* --------------------------------------- Add council member ---------------------------------------- */
    }
    {
      /* --------------------------------------------------------------------------------------------------- */
    }
    if (e.target.name === "newProposalCouncilMember") {
      const nearAccountValid = await accountExists(proposalTarget.value);
      let validateDescription = validateField(
        "proposalDescription",
        proposalDescription.value
      );

      if (nearAccountValid && validateDescription) {
        try {
          setShowSpinner(true);
          await window.contract.add_proposal(
            {
              proposal: {
                description: e.target.proposalDescription.value.trim(),
                kind: {
                  AddMemberToRole: {
                    member_id: e.target.proposalTarget.value,
                    role: "council",
                  },
                },
              },
            },
            new Decimal("30000000000000").toString(),
            daoPolicy.proposal_bond.toString()
          );
        } catch (e) {
          console.log(e);
          setShowError(e);
        } finally {
          setShowSpinner(false);
        }
      } else {
        if (!nearAccountValid) {
          e.target.proposalTarget.className += " is-invalid";
          e.target.proposalTarget.classList.remove("is-valid");
          setProposalTarget({
            value: proposalTarget.value,
            valid: false,
            message: "user account does not exist!",
          });
        } else {
          setProposalTarget({
            value: proposalTarget.value,
            valid: true,
            message: "",
          });
          e.target.proposalTarget.classList.remove("is-invalid");
          e.target.proposalTarget.className += " is-valid";
        }

        if (!validateDescription) {
          e.target.proposalDescription.className += " is-invalid";
          e.target.proposalDescription.classList.remove("is-valid");
        } else {
          e.target.proposalDescription.classList.remove("is-invalid");
          e.target.proposalDescription.className += " is-valid";
        }
      }
    }

    {
      /* --------------------------------------------------------------------------------------------------- */
    }
    {
      /* --------------------------------------- Remove council member ---------------------------------------- */
    }
    {
      /* --------------------------------------------------------------------------------------------------- */
    }
    if (e.target.name === "removeProposalCouncilMember") {
      const councilAccountValid =
        daoPolicy && daoPolicy.roles[1] && daoPolicy.roles[1].kind.Group
          ? daoPolicy.roles[1].kind.Group.includes(proposalTarget.value)
          : daoPolicy.roles[0].kind.Group.includes(proposalTarget.value);
      let validateDescription = validateField(
        "proposalDescription",
        proposalDescription.value
      );

      if (councilAccountValid && validateDescription) {
        try {
          setShowSpinner(true);
          await window.contract.add_proposal(
            {
              proposal: {
                description: e.target.proposalDescription.value.trim(),
                kind: {
                  RemoveMemberFromRole: {
                    member_id: e.target.proposalTarget.value,
                    role: "council",
                  },
                },
              },
            },
            new Decimal("30000000000000").toString(),
            daoPolicy.proposal_bond.toString()
          );
        } catch (e) {
          console.log(e);
          setShowError(e);
        } finally {
          setShowSpinner(false);
        }
      } else {
        if (!councilAccountValid) {
          e.target.proposalTarget.className += " is-invalid";
          e.target.proposalTarget.classList.remove("is-valid");
          setProposalTarget({
            value: proposalTarget.value,
            valid: false,
            message: "user account is not in council!",
          });
        } else {
          setProposalTarget({
            value: proposalTarget.value,
            valid: true,
            message: "",
          });
          e.target.proposalTarget.classList.remove("is-invalid");
          e.target.proposalTarget.className += " is-valid";
        }

        if (!validateDescription) {
          e.target.proposalDescription.className += " is-invalid";
          e.target.proposalDescription.classList.remove("is-valid");
        } else {
          e.target.proposalDescription.classList.remove("is-invalid");
          e.target.proposalDescription.className += " is-valid";
        }
      }
    }

    {
      /* --------------------------------------------------------------------------------------------------- */
    }
    {
      /* ---------------------------------------- Add payout proposal -------------------------------------- */
    }
    {
      /* --------------------------------------------------------------------------------------------------- */
    }
    if (e.target.name === "newProposalPayout") {
      const nearAccountValid = await accountExists(proposalTarget.value);
      let validateTarget = validateField(
        "proposalTarget",
        proposalTarget.value
      );
      let validateDescription = validateField(
        "proposalDescription",
        proposalDescription.value
      );

      let validatePaymentOption = true;
      if (paymentOption === "FT") {
        validatePaymentOption = validateField(
          "proposalFT",
          e.target.proposalFT.value
        );
      }

      let r = null;
      if (paymentOption === "FT") {
        const token = e.target.proposalFT.value.split(".");
        if (token.length === 3) {
          const tokenContract = new Contract(
            window.walletConnection.account(),
            token[1] + "." + token[2],
            {
              viewMethods: ["get_token"],
              changeMethods: [],
            }
          );
          r = await tokenContract.get_token({ token_id: token[0] });
        }
      }

      if (
        (validateTarget &&
          nearAccountValid &&
          validateDescription &&
          validatePaymentOption &&
          paymentOption === "FT" &&
          r) ||
        (paymentOption === "NEAR" && !r)
      ) {
        const amount = new Decimal(e.target.proposalAmount.value);
        const amountYokto = amount.mul(yoktoNear).toFixed();

        try {
          setShowSpinner(true);
          await window.contract.add_proposal(
            {
              proposal: {
                description: e.target.proposalDescription.value.trim(),
                kind: {
                  Transfer: {
                    token_id:
                      paymentOption === "NEAR" ? "" : e.target.proposalFT.value,
                    receiver_id: e.target.proposalTarget.value,
                    amount:
                      paymentOption === "NEAR"
                        ? amountYokto
                        : amount.mul("1e" + r.metadata.decimals).toFixed(),
                  },
                },
              },
            },
            new Decimal("30000000000000").toString(),
            daoPolicy.proposal_bond.toString()
          );
        } catch (e) {
          console.log(e);
          setShowError(e);
        } finally {
          setShowSpinner(false);
        }
      }
    }

    {
      /* --------------------------------------------------------------------------------------------------- */
    }
    {
      /* ------------------------------------------- Token Farm -------------------------------------------- */
    }
    {
      /* --------------------------------------------------------------------------------------------------- */
    }
    if (e.target.name === "newProposalToken") {
      let validateDescription = validateField(
        "proposalDescription",
        proposalDescription.value
      );
      let validateTokenDecimals = validateField(
        "proposalTokenDecimals",
        proposalTokenDecimals.value
      );
      let validateTokenSupply = validateField(
        "proposalTokenSupply",
        proposalTokenSupply.value
      );
      let validateTokenName = validateField(
        "proposalTokenName",
        proposalTokenName.value
      );
      let validateTokenSymbol = validateField(
        "proposalTokenSymbol",
        proposalTokenSymbol.value
      );

      if (
        validateDescription &&
        validateTokenDecimals &&
        validateTokenName &&
        validateTokenSupply &&
        validateTokenSymbol
      ) {
        const argsList = {
          args: {
            owner_id: e.target.proposalTokenOwner.value.trim(),
            total_supply: new Decimal(e.target.proposalTokenSupply.value.trim())
              .mul(new Decimal(10).pow(e.target.proposalTokenDecimals.value))
              .round(0, 0)
              .toFixed(0),
            metadata: {
              spec: "ft-1.0.0",
              name: e.target.proposalTokenName.value.trim(),
              symbol: e.target.proposalTokenSymbol.value.trim(),
              icon: e.target.proposalTokenIcon.value.trim(),
              decimals: "^" + e.target.proposalTokenDecimals.value + "^",
            },
          },
        };
        const args = Buffer.from(
          JSON.stringify(argsList).replaceAll('^"', "").replaceAll('"^', "")
        ).toString("base64");
        //console.log(argsList);

        try {
          setShowSpinner(true);
          await window.contract.add_proposal(
            {
              proposal: {
                description: e.target.proposalDescription.value.trim(),
                kind: {
                  FunctionCall: {
                    receiver_id: e.target.proposalTarget.value,
                    actions: [
                      {
                        method_name: "create_token",
                        args: args,
                        deposit: "5000000000000000000000000",
                        gas: "150000000000000",
                      },
                    ],
                  },
                },
              },
            },
            new Decimal("200000000000000").toString(),
            daoPolicy.proposal_bond.toString()
          );
        } catch (e) {
          console.log(e);
          setShowError(e);
        } finally {
          setShowSpinner(false);
        }
      } else {
        if (!validateDescription) {
          e.target.proposalDescription.className += " is-invalid";
          e.target.proposalDescription.classList.remove("is-valid");
        } else {
          e.target.proposalDescription.classList.remove("is-invalid");
          e.target.proposalDescription.className += " is-valid";
        }

        if (!validateTokenName) {
          e.target.proposalTokenName.className += " is-invalid";
          e.target.proposalTokenName.classList.remove("is-valid");
        } else {
          e.target.proposalTokenName.classList.remove("is-invalid");
          e.target.proposalTokenName.className += " is-valid";
        }

        if (!validateTokenSymbol) {
          e.target.proposalTokenSymbol.className += " is-invalid";
          e.target.proposalTokenSymbol.classList.remove("is-valid");
        } else {
          e.target.proposalTokenSymbol.classList.remove("is-invalid");
          e.target.proposalTokenSymbol.className += " is-valid";
        }

        if (!validateTokenSupply) {
          e.target.proposalTokenSupply.className += " is-invalid";
          e.target.proposalTokenSupply.classList.remove("is-valid");
        } else {
          e.target.proposalTokenSupply.classList.remove("is-invalid");
          e.target.proposalTokenSupply.className += " is-valid";
        }

        if (!validateTokenDecimals) {
          e.target.proposalTokenDecimals.className += " is-invalid";
          e.target.proposalTokenDecimals.classList.remove("is-valid");
        } else {
          e.target.proposalTokenDecimals.classList.remove("is-invalid");
          e.target.proposalTokenDecimals.className += " is-valid";
        }
      }
    }

    {
      /* --------------------------------------------------------------------------------------------------- */
    }
    {
      /* ------------------------------------------- Custom Call-------------------------------------------- */
    }
    {
      /* --------------------------------------------------------------------------------------------------- */
    }
    if (e.target.name === "newProposalCustomCall") {
      const nearAccountValid = await accountExists(proposalTarget.value);

      let validateDescription = validateField(
        "proposalDescription",
        proposalDescription.value
      );
      let validateCustomMethodName = validateField(
        "proposalCustomMethodName",
        proposalCustomMethodName.value
      );
      let validateCustomArgs = validateField(
        "proposalCustomArgs",
        proposalCustomArgs.value
      );
      let validateCustomDeposit = validateField(
        "proposalCustomDeposit",
        proposalCustomDeposit.value
      );

      if (
        nearAccountValid &&
        validateDescription &&
        validateCustomMethodName &&
        validateCustomArgs &&
        validateCustomDeposit
      ) {
        const argsList = JSON.parse(e.target.proposalCustomArgs.value.trim());
        const args = Buffer.from(
          JSON.stringify(argsList).replaceAll('^"', "").replaceAll('"^', "")
        ).toString("base64");

        const deposit = new Decimal(e.target.proposalCustomDeposit.value);
        const depositYokto = deposit.mul(yoktoNear).toFixed();

        try {
          setShowSpinner(true);
          await window.contract.add_proposal(
            {
              proposal: {
                description: e.target.proposalDescription.value.trim(),
                kind: {
                  FunctionCall: {
                    receiver_id: e.target.proposalTarget.value,
                    actions: [
                      {
                        method_name:
                          e.target.proposalCustomMethodName.value.trim(),
                        args: args,
                        deposit: depositYokto,
                        gas: "150000000000000",
                      },
                    ],
                  },
                },
              },
            },
            new Decimal("250000000000000").toString(),
            daoPolicy.proposal_bond.toString()
          );
        } catch (e) {
          console.log(e);
          setShowError(e);
        } finally {
          setShowSpinner(false);
        }
      } else {
        if (!nearAccountValid) {
          e.target.proposalTarget.className += " is-invalid";
          e.target.proposalTarget.classList.remove("is-valid");
          setProposalTarget({
            value: proposalTarget.value,
            valid: false,
            message: "contract does not exist!",
          });
        } else {
          setProposalTarget({
            value: proposalTarget.value,
            valid: true,
            message: "",
          });
          e.target.proposalTarget.classList.remove("is-invalid");
          e.target.proposalTarget.className += " is-valid";
        }

        if (!validateDescription) {
          e.target.proposalDescription.className += " is-invalid";
          e.target.proposalDescription.classList.remove("is-valid");
        } else {
          e.target.proposalDescription.classList.remove("is-invalid");
          e.target.proposalDescription.className += " is-valid";
        }

        if (!validateCustomMethodName) {
          e.target.proposalCustomMethodName.className += " is-invalid";
          e.target.proposalCustomMethodName.classList.remove("is-valid");
        } else {
          e.target.proposalCustomMethodName.classList.remove("is-invalid");
          e.target.proposalCustomMethodName.className += " is-valid";
        }

        if (!validateCustomArgs) {
          e.target.proposalCustomArgs.className += " is-invalid";
          e.target.proposalCustomArgs.classList.remove("is-valid");
        } else {
          e.target.proposalCustomArgs.classList.remove("is-invalid");
          e.target.proposalCustomArgs.className += " is-valid";
        }

        if (!validateCustomDeposit) {
          e.target.proposalCustomDeposit.className += " is-invalid";
          e.target.proposalCustomDeposit.classList.remove("is-valid");
        } else {
          e.target.proposalCustomDeposit.classList.remove("is-invalid");
          e.target.proposalCustomDeposit.className += " is-valid";
        }
      }
    }

    {
      /* --------------------------------------------------------------------------------------------------- */
    }
    {
      /* ------------------------------------------- near.social -------------------------------------------- */
    }
    {
      /* --------------------------------------------------------------------------------------------------- */
    }

    if (e.target.name === "newProposalNearSocialPost") {
      const nearAccountValid = await accountExists(
        nearConfig.nearSocialContractName
      );
      let validateDescription = validateField(
        "proposalDescription",
        proposalDescription.value
      );
      let validateCustomArgs = validateField(
        "proposalCustomArgs",
        proposalCustomArgs.value
      );

      function replacer(key, value) {
        if (key === "text") {
          return e.target.proposalCustomArgs.value;
        }
        return value;
      }

      let validateCustomDeposit = validateField(
        "proposalCustomDeposit",
        proposalCustomDeposit.value
      );
      if (
        nearAccountValid &&
        validateDescription &&
        validateCustomArgs &&
        validateCustomDeposit
      ) {
        const args = Buffer.from(
          JSON.stringify({
            data: {
              [stateCtx.config.contract]: {
                post: {
                  main: JSON.stringify({
                    type: "md",
                    text: e.target.proposalCustomArgs.value,
                  }),
                },
                index: {
                  post: JSON.stringify({
                    key: "main",
                    value: {
                      type: "md",
                    },
                  }),
                },
              },
            },
          })
        ).toString("base64");

        const deposit = new Decimal(e.target.proposalCustomDeposit.value);
        const depositYokto = deposit.mul(yoktoNear).toFixed();
        try {
          setShowSpinner(true);
          await window.contract.add_proposal(
            {
              proposal: {
                description: e.target.proposalDescription.value.trim(),
                kind: {
                  FunctionCall: {
                    receiver_id: nearConfig.nearSocialContractName,
                    actions: [
                      {
                        method_name: "set",
                        args: args,
                        deposit: depositYokto,
                        gas: "150000000000000",
                      },
                    ],
                  },
                },
              },
            },
            new Decimal("250000000000000").toString(),
            daoPolicy.proposal_bond.toString()
          );
        } catch (e) {
          console.log(e);
          setShowError(e);
        } finally {
          setShowSpinner(false);
        }
      } else {
        if (!nearAccountValid) {
          e.target.proposalTarget.className += " is-invalid";
          e.target.proposalTarget.classList.remove("is-valid");
          setProposalTarget({
            value: proposalTarget.value,
            valid: false,
            message: "contract does not exist!",
          });
        } else {
          setProposalTarget({
            value: nearConfig.nearSocialContractName,
            valid: true,
            message: "",
          });
          e.target.proposalTarget.classList.remove("is-invalid");
          e.target.proposalTarget.className += " is-valid";
        }

        if (!validateDescription) {
          e.target.proposalDescription.className += " is-invalid";
          e.target.proposalDescription.classList.remove("is-valid");
        } else {
          e.target.proposalDescription.classList.remove("is-invalid");
          e.target.proposalDescription.className += " is-valid";
        }

        if (!validateCustomArgs) {
          e.target.proposalCustomArgs.className += " is-invalid";
          e.target.proposalCustomArgs.classList.remove("is-valid");
        } else {
          e.target.proposalCustomArgs.classList.remove("is-invalid");
          e.target.proposalCustomArgs.className += " is-valid";
        }

        if (!validateCustomDeposit) {
          e.target.proposalCustomDeposit.className += " is-invalid";
          e.target.proposalCustomDeposit.classList.remove("is-valid");
        } else {
          e.target.proposalCustomDeposit.classList.remove("is-invalid");
          e.target.proposalCustomDeposit.className += " is-valid";
        }
      }
    }
  };

  const handlePayOption = (e) => {
    e.preventDefault();
    e.persist();
    setPaymentOption(e.target.value);
  };

  const [batchVotes, setBatchVotes] = useState([]);
  console.log(batchVotes);

  let roles = daoPolicy
    ? daoPolicy.roles.filter((item) => item.name !== "all")
    : [];
  return (
    <>
      <MDBView className="w-100 h-100" style={{ minHeight: "100vh" }}>
        <MDBMask className="d-flex justify-content-center align-items-center unique-color-dark gradient" />
        <Navbar />
        <MDBContainer style={{ minHeight: "100vh" }}>
          <MDBAlert color="danger" className="text-center">
            Beta software. Test in prod. <b>Not audited.</b> Use at your own
            risk!
          </MDBAlert>

          <MDBAlert
            color={
              stateCtx.config.network.networkId === "testnet"
                ? "danger"
                : "secondary"
            }
            className="text-center h3-responsive"
          >
            <b style={{ textTransform: "uppercase" }}>
              {stateCtx.config.network.networkId}
            </b>
          </MDBAlert>
          {stateCtx.config.contract && !selectDao ? (
            <>
              <MDBRow>
                <MDBCol className="col-12 p-3 mx-auto">
                  <MDBCard className="stylish-color">
                    <MDBCardBody>
                      <MDBRow>
                        <MDBCol>
                          {roles.map((item, key) => (
                            <MDBCard
                              className="p-0 m-2 stylish-color-dark white-text"
                              key={key}
                            >
                              <MDBCardHeader className="h4-responsive">
                                {item.name}
                              </MDBCardHeader>
                              <MDBCardBody className="p-4">
                                {item.kind.Group.map((i, k) => (
                                  <div key={k}>{i}</div>
                                ))}
                              </MDBCardBody>
                            </MDBCard>
                          ))}
                        </MDBCol>
                        <MDBCol className="col-12 col-md-6">
                          <MDBCard className="p-0 m-2 stylish-color-dark white-text">
                            <MDBCardHeader className="h5-responsive">
                              <MDBRow>
                                <MDBCol>Properties:</MDBCol>
                                <MDBCol className="">
                                  <MDBBox className="text-right">
                                    <MDBBtn
                                      size="sm"
                                      onClick={handleDaoChange}
                                      color="elegant"
                                    >
                                      Change DAO
                                    </MDBBtn>
                                  </MDBBox>
                                </MDBCol>
                              </MDBRow>
                            </MDBCardHeader>
                            <MDBCardBody className="p-2">
                              <ul>
                                <li>
                                  Network:{" "}
                                  <a
                                    className="white-text btn-link"
                                    target="_blank"
                                    href={stateCtx.config.network.explorerUrl}
                                  >
                                    {stateCtx.config.network.networkId}
                                  </a>
                                </li>
                                <li>DAO: {stateCtx.config.contract}</li>
                                <li>
                                  Bond: <span style={{ fontSize: 12 }}>Ⓝ </span>
                                  {daoPolicy && daoPolicy.proposal_bond !== null
                                    ? new Decimal(
                                        daoPolicy.proposal_bond.toString()
                                      )
                                        .div(yoktoNear)
                                        .toString()
                                    : ""}
                                </li>
                                <li>
                                  Purpose:{" "}
                                  {daoConfig
                                    ? daoConfig.purpose
                                        .split(" ")
                                        .map((item, key) =>
                                          /(((https?:\/\/)|(www\.))[^\s]+)/g.test(
                                            item
                                          ) ? (
                                            <a
                                              className="white-text btn-link"
                                              target="_blank"
                                              href={item}
                                            >
                                              {item}{" "}
                                            </a>
                                          ) : (
                                            <>{item} </>
                                          )
                                        )
                                    : null}
                                </li>
                                <li>
                                  Vote Period:{" "}
                                  {daoPolicy
                                    ? timestampToReadable(
                                        daoPolicy.proposal_period
                                      )
                                    : ""}
                                </li>
                                <li>
                                  Staking Contract:{" "}
                                  {daoStaking ? daoStaking : ""}
                                </li>
                                <li>DAO Funds: Ⓝ {daoState ? daoState : ""}</li>
                              </ul>
                            </MDBCardBody>
                          </MDBCard>
                        </MDBCol>
                      </MDBRow>
                      {window.walletConnection.getAccountId() ? (
                        <MDBRow className="mx-auto p-2">
                          <MDBCol className="text-center">
                            <MDBBtn
                              style={{ borderRadius: 10 }}
                              size="sm"
                              onClick={toggleProposalModal}
                              color="elegant"
                            >
                              ADD NEW PROPOSAL
                            </MDBBtn>
                          </MDBCol>
                        </MDBRow>
                      ) : null}
                    </MDBCardBody>
                  </MDBCard>
                </MDBCol>
              </MDBRow>

              <MDBRow>
                <MDBCol className="col-12 p-3 mx-auto">
                  <MDBCard className="stylish-color-dark white-text">
                    <MDBCardBody>
                      <MDBRow center>
                        <MDBCard className="p-2 mr-2 mb-2 elegant-color white-text">
                          <div className="custom-control custom-switch mr-2">
                            <input
                              type="checkbox"
                              className="custom-control-input"
                              id="batchVote"
                              checked={false}
                              onChange={handleSwitchChange("batchVote")}
                              readOnly
                            />
                            <label
                              className="custom-control-label"
                              htmlFor="batchVote"
                            >
                              Multi Vote
                            </label>
                          </div>
                        </MDBCard>
                        <MDBCard className="p-2 mr-2 mb-2 stylish-color-dark white-text">
                          <div className="custom-control custom-switch mr-2">
                            <input
                              type="checkbox"
                              className="custom-control-input"
                              id="switchAll"
                              checked={switchState.switchAll}
                              onChange={handleSwitchChange("switchAll")}
                              readOnly
                            />
                            <label
                              className="custom-control-label"
                              htmlFor="switchAll"
                            >
                              Show All
                            </label>
                          </div>
                        </MDBCard>
                        <MDBCard className="p-2 mr-2 mb-2 stylish-color-dark white-text">
                          <div className="custom-control custom-switch mr-2">
                            <input
                              type="checkbox"
                              className="custom-control-input"
                              id="switchInProgress"
                              checked={switchState.switchInProgress}
                              onChange={handleSwitchChange("switchInProgress")}
                              readOnly
                            />
                            <label
                              className="custom-control-label"
                              htmlFor="switchInProgress"
                            >
                              In Progress
                            </label>
                          </div>
                        </MDBCard>
                        <MDBCard className="p-2 mr-2 mb-2 stylish-color-dark white-text">
                          <div className="custom-control custom-switch mr-2">
                            <input
                              type="checkbox"
                              className="custom-control-input"
                              id="switchDone"
                              checked={switchState.switchDone}
                              onChange={handleSwitchChange("switchDone")}
                              readOnly
                            />
                            <label
                              className="custom-control-label"
                              htmlFor="switchDone"
                            >
                              Done
                            </label>
                          </div>
                        </MDBCard>
                        <MDBCard className="p-2 mb-2 stylish-color-dark white-text">
                          <div className="custom-control custom-switch mr-2">
                            <input
                              type="checkbox"
                              className="custom-control-input"
                              id="switchExpired"
                              checked={switchState.switchExpired}
                              onChange={handleSwitchChange("switchExpired")}
                              readOnly
                            />
                            <label
                              className="custom-control-label"
                              htmlFor="switchExpired"
                            >
                              Expired
                            </label>
                          </div>
                        </MDBCard>
                      </MDBRow>
                    </MDBCardBody>
                  </MDBCard>
                </MDBCol>
              </MDBRow>

              <MDBRow className="">
                {daoPolicy && numberProposals > 0 && proposals !== null
                  ? proposals
                      .sort((a, b) => (b.key >= a.key ? 1 : -1))
                      .map((item, key) => (
                        <>
                          {(convertDuration(
                            new Decimal(item.submission_time).plus(
                              daoPolicy.proposal_period
                            )
                          ) > new Date() &&
                            item.status === "InProgress" &&
                            switchState.switchInProgress) ||
                          (convertDuration(
                            new Decimal(item.submission_time).plus(
                              daoPolicy.proposal_period
                            )
                          ) < new Date() &&
                            item.status === "InProgress" &&
                            switchState.switchExpired) ||
                          (item.status === "Expired" &&
                            switchState.switchExpired) ||
                          switchState.switchAll ||
                          (item.status === "Rejected" &&
                            switchState.switchDone) ||
                          (item.status === "Approved" &&
                            switchState.switchDone) ||
                          (item.status === "Removed" &&
                            switchState.switchDone) ||
                          (convertDuration(
                            new Decimal(item.submission_time).plus(
                              daoPolicy.proposal_period
                            )
                          ) > new Date() &&
                            item.status === "InProgress" &&
                            item.key >= stateCtx.config.lastShownProposal &&
                            switchState.switchNew) ? (
                            <Proposal
                              dao={stateCtx.config.contract}
                              data={item}
                              key={item.id}
                              id={item.id}
                              daoPolicy={daoPolicy}
                              setShowError={setShowError}
                              isBatchVote={true}
                              setBatchVotes={setBatchVotes}
                              roles={roles}
                            />
                          ) : null}
                        </>
                      ))
                  : null}
              </MDBRow>
              {showError !== null ? (
                <MDBNotification
                  autohide={36000}
                  bodyClassName="p-5 font-weight-bold white-text"
                  className="stylish-color-dark"
                  closeClassName="white-text"
                  fade
                  icon="bell"
                  iconClassName="orange-text"
                  message={showError.toString().trim()}
                  show
                  text=""
                  title=""
                  titleClassName="elegant-color-dark white-text"
                  style={{
                    position: "fixed",
                    top: "60px",
                    right: "10px",
                    zIndex: 9999,
                  }}
                />
              ) : null}

              {showNewProposalNotification ? (
                <MDBNotification
                  autohide={36000}
                  bodyClassName="p-5 font-weight-bold white-text"
                  className="stylish-color-dark"
                  closeClassName="white-text"
                  fade
                  icon="bell"
                  iconClassName="orange-text"
                  message="A new proposal has been added!"
                  show
                  text=""
                  title=""
                  titleClassName="elegant-color-dark white-text"
                  style={{
                    position: "fixed",
                    top: "60px",
                    left: "10px",
                    zIndex: 9999,
                  }}
                />
              ) : null}
              {daoPolicy ? (
                <MDBModal
                  isOpen={addProposalModal}
                  toggle={toggleProposalModal}
                  centered
                  position="center"
                  size="lg"
                >
                  <MDBModalHeader
                    className="text-center stylish-color white-text border-dark"
                    titleClass="w-100 font-weight-bold"
                    toggle={toggleProposalModal}
                  >
                    Select Proposal Type
                  </MDBModalHeader>
                  <MDBModalBody style={{ background: "rgb(213, 211, 211)" }}>
                    <MDBRow>
                      <MDBCol className="col-12 col-md-6 col-lg-5 mb-1">
                        <MDBCard className="p-md-3 m-md-3 stylish-color-dark">
                          <MDBCardBody className="text-center white-text">
                            <MDBIcon icon="user-secret" size="4x" />
                            <hr />
                            <div>Council Member</div>
                            <MDBBtn
                              onClick={toggleNewCouncilMember}
                              color="blue-grey"
                              size="sm"
                              className="float-left"
                            >
                              Add
                            </MDBBtn>
                            <MDBBtn
                              onClick={toggleRemoveCouncilMember}
                              color="red"
                              size="sm"
                              className="float-right"
                            >
                              Remove
                            </MDBBtn>
                          </MDBCardBody>
                        </MDBCard>
                      </MDBCol>
                      <MDBCol className="col-12 col-md-6 col-lg-4 mb-1">
                        <MDBCard className="p-md-3 m-md-3 stylish-color-dark">
                          <MDBCardBody className="text-center white-text">
                            <MDBIcon icon="hand-holding-usd" size="4x" />
                            <hr />
                            <a
                              href="#"
                              onClick={toggleNewPayout}
                              className="stretched-link grey-text white-hover"
                            >
                              Payout
                            </a>
                          </MDBCardBody>
                        </MDBCard>
                      </MDBCol>
                      <MDBCol className="col-12 col-md-6 col-lg-4 mb-1">
                        <MDBCard className="p-md-3 m-md-3 stylish-color-dark">
                          <MDBCardBody className="text-center white-text">
                            <MDBIcon icon="tractor" size="4x" />
                            <hr />
                            <a
                              href="#"
                              onClick={toggleNewToken}
                              className="stretched-link grey-text white-hover"
                            >
                              Token farm
                            </a>
                          </MDBCardBody>
                        </MDBCard>
                      </MDBCol>
                      <MDBCol className="col-12 col-md-6 col-lg-4 mb-1">
                        <MDBCard className="p-md-3 m-md-3 stylish-color-dark">
                          <MDBCardBody className="text-center white-text">
                            <MDBIcon icon="cogs" size="4x" />
                            <hr />
                            <a
                              href="#"
                              onClick={toggleCustomCall}
                              className="stretched-link grey-text white-hover"
                            >
                              Custom function
                            </a>
                          </MDBCardBody>
                        </MDBCard>
                      </MDBCol>
                      <MDBCol className="col-12 col-md-6 col-lg-4 mb-1">
                        <MDBCard className="p-md-3 m-md-3 stylish-color-dark">
                          <MDBCardBody className="text-center white-text">
                            <img
                              src={nearSocialLogoSvg}
                              style={{ height: 64, margin: "0 auto" }}
                            />
                            <hr />
                            <a
                              href="#"
                              onClick={toggleNearSocialPost}
                              className="stretched-link grey-text white-hover"
                            >
                              near.social
                            </a>
                          </MDBCardBody>
                        </MDBCard>
                      </MDBCol>
                      <MDBCol className="col-12 col-md-6 col-lg-4 mb-1">
                        <MDBCard className="p-md-3 m-md-3 stylish-color-dark">
                          <MDBCardBody className="text-center white-text">
                            <img
                              src={roketoLogoSvg}
                              style={{ height: 64, marginLeft: -20 }}
                            ></img>

                            <hr />
                            <a
                              href="#"
                              onClick={toggleRoketoStream}
                              className="stretched-link grey-text white-hover"
                            >
                              Roketo stream
                            </a>
                          </MDBCardBody>
                        </MDBCard>
                      </MDBCol>
                    </MDBRow>
                  </MDBModalBody>
                </MDBModal>
              ) : null}

              {/* --------------------------------------------------------------------------------------------------- */}
              {/* --------------------------------------- Add council member ---------------------------------------- */}
              {/* --------------------------------------------------------------------------------------------------- */}
              <MDBModal
                isOpen={newProposalCouncilMember}
                toggle={toggleNewCouncilMember}
                centered
                position="center"
                size="lg"
              >
                <MDBModalHeader
                  className="text-center stylish-color white-text border-dark"
                  titleClass="w-100 font-weight-bold"
                  toggle={toggleNewCouncilMember}
                >
                  Add Council Member
                </MDBModalHeader>
                <form
                  className="needs-validation mx-3 grey-text"
                  name="newProposalCouncilMember"
                  noValidate
                  method="post"
                  onSubmit={submitProposal}
                >
                  <MDBModalBody>
                    <MDBInput
                      disabled={disableTarget}
                      name="proposalTarget"
                      value={proposalTarget.value}
                      onChange={changeHandler}
                      label="Enter account"
                      required
                      group
                    >
                      <div className="invalid-feedback">
                        {proposalTarget.message}
                      </div>
                    </MDBInput>
                    <MDBInput
                      name="proposalDescription"
                      value={proposalDescription.value}
                      onChange={changeHandler}
                      required
                      label="Enter description"
                      group
                    >
                      <div className="invalid-feedback">
                        {proposalDescription.message}
                      </div>
                    </MDBInput>
                    {daoPolicy ? (
                      <MDBAlert color="warning">
                        You will pay a deposit of{" "}
                        <span style={{ fontSize: 13 }}>Ⓝ</span>
                        {new Decimal(daoPolicy.proposal_bond.toString())
                          .div(yoktoNear)
                          .toFixed(2)}{" "}
                        to add this proposal!
                      </MDBAlert>
                    ) : null}
                    <MDBBox className="text-muted font-small ml-2">
                      *the deposit will be refunded if proposal rejected or
                      expired.
                    </MDBBox>
                  </MDBModalBody>
                  <MDBModalFooter className="justify-content-center">
                    <MDBBtn color="elegant" type="submit">
                      Submit
                      {showSpinner ? (
                        <div
                          className="spinner-border spinner-border-sm ml-2"
                          role="status"
                        >
                          <span className="sr-only">Loading...</span>
                        </div>
                      ) : null}
                    </MDBBtn>
                  </MDBModalFooter>
                </form>
              </MDBModal>

              {/* --------------------------------------------------------------------------------------------------- */}
              {/* --------------------------------------- Remove council member ---------------------------------------- */}
              {/* --------------------------------------------------------------------------------------------------- */}
              <MDBModal
                isOpen={removeProposalCouncilMember}
                toggle={toggleRemoveCouncilMember}
                centered
                position="center"
                size="lg"
              >
                <MDBModalHeader
                  className="text-center stylish-color white-text border-dark"
                  titleClass="w-100 font-weight-bold"
                  toggle={toggleRemoveCouncilMember}
                >
                  Remove Council Member
                </MDBModalHeader>
                <form
                  className="needs-validation mx-3 grey-text"
                  name="removeProposalCouncilMember"
                  noValidate
                  method="post"
                  onSubmit={submitProposal}
                >
                  <MDBModalBody>
                    <MDBInput
                      disabled={disableTarget}
                      name="proposalTarget"
                      value={proposalTarget.value}
                      onChange={changeHandler}
                      label="Enter account"
                      required
                      group
                    >
                      <div className="invalid-feedback">
                        {proposalTarget.message}
                      </div>
                    </MDBInput>
                    <MDBInput
                      name="proposalDescription"
                      value={proposalDescription.value}
                      onChange={changeHandler}
                      required
                      label="Enter description"
                      group
                    >
                      <div className="invalid-feedback">
                        {proposalDescription.message}
                      </div>
                    </MDBInput>
                    {daoPolicy ? (
                      <MDBAlert color="warning">
                        You will pay a deposit of{" "}
                        <span style={{ fontSize: 13 }}>Ⓝ</span>
                        {new Decimal(daoPolicy.proposal_bond.toString())
                          .div(yoktoNear)
                          .toFixed(2)}{" "}
                        to add this proposal!
                      </MDBAlert>
                    ) : null}
                    <MDBBox className="text-muted font-small ml-2">
                      *the deposit will be refunded if proposal rejected or
                      expired.
                    </MDBBox>
                  </MDBModalBody>
                  <MDBModalFooter className="justify-content-center">
                    <MDBBtn color="elegant" type="submit">
                      Submit
                      {showSpinner ? (
                        <div
                          className="spinner-border spinner-border-sm ml-2"
                          role="status"
                        >
                          <span className="sr-only">Loading...</span>
                        </div>
                      ) : null}
                    </MDBBtn>
                  </MDBModalFooter>
                </form>
              </MDBModal>

              {/* --------------------------------------------------------------------------------------------------- */}
              {/* --------------------------------------- Roketo Stream ------------------------------------------------ */}
              {/* --------------------------------------------------------------------------------------------------- */}
              <MDBModal
                isOpen={newProposalRoketoStream}
                toggle={toggleRoketoStream}
                centered
                position="center"
                size="lg"
              >
                <MDBModalHeader
                  className="text-center stylish-color white-text border-dark"
                  titleClass="w-100 font-weight-bold"
                  toggle={toggleRoketoStream}
                >
                  Add Payout
                </MDBModalHeader>
                <form
                  className="needs-validation mx-3 grey-text"
                  name="newProposalRoketoStream"
                  noValidate
                  method="post"
                  onSubmit={submitProposal}
                >
                  <MDBModalBody>
                    <MDBInput
                      disabled={disableTarget}
                      name="proposalTarget"
                      value={proposalTarget.value}
                      onChange={changeHandler}
                      label="Enter receiver account"
                      required
                      group
                    >
                      <div className="invalid-feedback">
                        {proposalTarget.message}
                      </div>
                    </MDBInput>
                    <MDBInput
                      name="proposalDescription"
                      value={proposalDescription.value}
                      onChange={changeHandler}
                      required
                      label="Enter description"
                      group
                    >
                      <div className="invalid-feedback">
                        {proposalDescription.message}
                      </div>
                    </MDBInput>
                    <MDBBox>Pay with</MDBBox>
                    <select
                      onChange={handlePayOption}
                      name="paymentOption"
                      className="browser-default custom-select"
                    >
                      <option selected value="NEAR">
                        NEAR
                      </option>
                      <option value="FT">Fungible Token</option>
                    </select>
                    {paymentOption === "FT" ? (
                      <MDBInput
                        value={proposalFT.value}
                        name="proposalFT"
                        onChange={changeHandler}
                        required
                        label="Fungible token address"
                        group
                      >
                        <div className="invalid-feedback">
                          {proposalFT.message}
                        </div>
                      </MDBInput>
                    ) : null}
                    <MDBInput
                      value={proposalAmount.value}
                      name="proposalAmount"
                      onChange={changeHandler}
                      required
                      label="Enter amount"
                      group
                    >
                      <div className="invalid-feedback">
                        {proposalAmount.message}
                      </div>
                    </MDBInput>
                    <MDBInput
                      value={proposalRoketoSpeed.value}
                      name="proposalRoketoSpeed"
                      onChange={changeHandler}
                      required
                      label="Enter stream speed per second"
                      group
                    >
                      <div className="invalid-feedback">
                        {proposalRoketoSpeed.message}
                      </div>
                    </MDBInput>
                    {daoPolicy ? (
                      <MDBAlert color="warning">
                        You will pay a deposit of{" "}
                        <span style={{ fontSize: 13 }}>Ⓝ</span>
                        {new Decimal(daoPolicy.proposal_bond.toString())
                          .div(yoktoNear)
                          .toFixed(2)}{" "}
                        to add this proposal!
                      </MDBAlert>
                    ) : null}
                    <MDBBox className="text-muted font-small ml-2">
                      *the deposit will be refunded if proposal rejected or
                      expired.
                    </MDBBox>
                  </MDBModalBody>
                  <MDBModalFooter className="justify-content-center">
                    <MDBBtn color="elegant" type="submit">
                      Submit
                      {showSpinner ? (
                        <div
                          className="spinner-border spinner-border-sm ml-2"
                          role="status"
                        >
                          <span className="sr-only">Loading...</span>
                        </div>
                      ) : null}
                    </MDBBtn>
                  </MDBModalFooter>
                </form>
              </MDBModal>
              {/* --------------------------------------------------------------------------------------------------- */}
              {/* --------------------------------------- Add payout ------------------------------------------------ */}
              {/* --------------------------------------------------------------------------------------------------- */}
              <MDBModal
                isOpen={newProposalPayout}
                toggle={toggleNewPayout}
                centered
                position="center"
                size="lg"
              >
                <MDBModalHeader
                  className="text-center stylish-color white-text border-dark"
                  titleClass="w-100 font-weight-bold"
                  toggle={toggleNewPayout}
                >
                  Add Payout
                </MDBModalHeader>
                <form
                  className="needs-validation mx-3 grey-text"
                  name="newProposalPayout"
                  noValidate
                  method="post"
                  onSubmit={submitProposal}
                >
                  <MDBModalBody>
                    <MDBInput
                      disabled={disableTarget}
                      name="proposalTarget"
                      value={proposalTarget.value}
                      onChange={changeHandler}
                      label="Enter receiver account"
                      required
                      group
                    >
                      <div className="invalid-feedback">
                        {proposalTarget.message}
                      </div>
                    </MDBInput>
                    <MDBInput
                      name="proposalDescription"
                      value={proposalDescription.value}
                      onChange={changeHandler}
                      required
                      label="Enter description"
                      group
                    >
                      <div className="invalid-feedback">
                        {proposalDescription.message}
                      </div>
                    </MDBInput>
                    <MDBBox>Pay with</MDBBox>
                    <select
                      onChange={handlePayOption}
                      name="paymentOption"
                      className="browser-default custom-select"
                    >
                      <option selected value="NEAR">
                        NEAR
                      </option>
                      <option value="FT">Fungible Token</option>
                    </select>
                    {paymentOption === "FT" ? (
                      <MDBInput
                        value={proposalFT.value}
                        name="proposalFT"
                        onChange={changeHandler}
                        required
                        label="Fungible token address"
                        group
                      >
                        <div className="invalid-feedback">
                          {proposalFT.message}
                        </div>
                      </MDBInput>
                    ) : null}
                    <MDBInput
                      value={proposalAmount.value}
                      name="proposalAmount"
                      onChange={changeHandler}
                      required
                      label="Enter amount"
                      group
                    >
                      <div className="invalid-feedback">
                        {proposalAmount.message}
                      </div>
                    </MDBInput>
                    {daoPolicy ? (
                      <MDBAlert color="warning">
                        You will pay a deposit of{" "}
                        <span style={{ fontSize: 13 }}>Ⓝ</span>
                        {new Decimal(daoPolicy.proposal_bond.toString())
                          .div(yoktoNear)
                          .toFixed(2)}{" "}
                        to add this proposal!
                      </MDBAlert>
                    ) : null}
                    <MDBBox className="text-muted font-small ml-2">
                      *the deposit will be refunded if proposal rejected or
                      expired.
                    </MDBBox>
                  </MDBModalBody>
                  <MDBModalFooter className="justify-content-center">
                    <MDBBtn color="elegant" type="submit">
                      Submit
                      {showSpinner ? (
                        <div
                          className="spinner-border spinner-border-sm ml-2"
                          role="status"
                        >
                          <span className="sr-only">Loading...</span>
                        </div>
                      ) : null}
                    </MDBBtn>
                  </MDBModalFooter>
                </form>
              </MDBModal>

              {/* --------------------------------------------------------------------------------------------------- */}
              {/* --------------------------------------- Token Farm ------------------------------------------------ */}
              {/* --------------------------------------------------------------------------------------------------- */}
              <MDBModal
                isOpen={newProposalToken}
                toggle={toggleNewToken}
                centered
                position="center"
                size="lg"
              >
                <MDBModalHeader
                  className="text-center stylish-color white-text border-dark"
                  titleClass="w-100 font-weight-bold"
                  toggle={toggleNewToken}
                >
                  Create a new Token
                </MDBModalHeader>
                <form
                  className="needs-validation mx-3 grey-text"
                  name="newProposalToken"
                  noValidate
                  method="post"
                  onSubmit={submitProposal}
                >
                  <MDBModalBody>
                    <MDBInput
                      disabled={true}
                      name="proposalTokenOwner"
                      value={proposalTokenOwner.value}
                      onChange={changeHandler}
                      label="Enter owner account"
                      required
                      group
                    >
                      <div className="invalid-feedback">
                        {proposalTokenOwner.message}
                      </div>
                    </MDBInput>
                    <MDBInput
                      name="proposalTokenSupply"
                      value={proposalTokenSupply.value}
                      onChange={changeHandler}
                      label="Total Supply"
                      required
                      group
                    >
                      <div className="invalid-feedback">
                        {proposalTokenSupply.message}
                      </div>
                    </MDBInput>
                    <MDBInput
                      name="proposalTokenName"
                      value={proposalTokenName.value}
                      onChange={changeHandler}
                      label="Token Name"
                      required
                      group
                    >
                      <div className="invalid-feedback">
                        {proposalTokenName.message}
                      </div>
                    </MDBInput>
                    <MDBInput
                      name="proposalTokenSymbol"
                      value={proposalTokenSymbol.value}
                      onChange={changeHandler}
                      label="Token Symbol"
                      required
                      group
                    >
                      <div className="invalid-feedback">
                        {proposalTokenSymbol.message}
                      </div>
                    </MDBInput>
                    <MDBInput
                      disabled={true}
                      name="proposalTokenIcon"
                      value={proposalTokenIcon.value}
                      onChange={changeHandler}
                      label="Token Icon URL"
                      required
                      group
                    >
                      <div className="invalid-feedback">
                        {proposalTokenIcon.message}
                      </div>
                    </MDBInput>
                    <MDBInput
                      name="proposalTokenDecimals"
                      value={proposalTokenDecimals.value}
                      onChange={changeHandler}
                      label="Token Decimals"
                      required
                      group
                    >
                      <div className="invalid-feedback">
                        {proposalTokenDecimals.message}
                      </div>
                    </MDBInput>
                    <MDBInput
                      disabled={true}
                      name="proposalTarget"
                      value={proposalTarget.value}
                      onChange={changeHandler}
                      label="Enter receiver account"
                      group
                    >
                      <div className="invalid-feedback">
                        {proposalTarget.message}
                      </div>
                    </MDBInput>
                    <MDBInput
                      name="proposalDescription"
                      value={proposalDescription.value}
                      onChange={changeHandler}
                      required
                      label="Enter description"
                      group
                    >
                      <div className="invalid-feedback">
                        {proposalDescription.message}
                      </div>
                    </MDBInput>
                    {daoPolicy ? (
                      <>
                        <MDBAlert color="warning">
                          You will pay a deposit of{" "}
                          <span style={{ fontSize: 13 }}>Ⓝ</span>
                          {new Decimal(daoPolicy.proposal_bond.toString())
                            .div(yoktoNear)
                            .toFixed(2)}{" "}
                          to add this proposal!
                        </MDBAlert>
                        <MDBAlert color="warning">
                          Please make sure DAO has at least{" "}
                          <span style={{ fontSize: 13 }}>Ⓝ</span>5 (for deposit)
                          at the time of approval!
                        </MDBAlert>
                      </>
                    ) : null}
                    <MDBBox className="text-muted font-small ml-2">
                      *the deposit will be refunded if proposal rejected or
                      expired.
                    </MDBBox>
                  </MDBModalBody>
                  <MDBModalFooter className="justify-content-center">
                    <MDBBtn color="elegant" type="submit">
                      Submit
                      {showSpinner ? (
                        <div
                          className="spinner-border spinner-border-sm ml-2"
                          role="status"
                        >
                          <span className="sr-only">Loading...</span>
                        </div>
                      ) : null}
                    </MDBBtn>
                  </MDBModalFooter>
                </form>
              </MDBModal>

              {/* --------------------------------------------------------------------------------------------------- */}
              {/* --------------------------------------- Custom Call ----------------------------------------------- */}
              {/* --------------------------------------------------------------------------------------------------- */}
              <MDBModal
                isOpen={newProposalCustomCall}
                toggle={toggleCustomCall}
                centered
                position="center"
                size="lg"
              >
                <MDBModalHeader
                  className="text-center stylish-color white-text border-dark"
                  titleClass="w-100 font-weight-bold"
                  toggle={toggleCustomCall}
                >
                  Custom function call
                </MDBModalHeader>
                <form
                  className="needs-validation mx-3 grey-text"
                  name="newProposalCustomCall"
                  noValidate
                  method="post"
                  onSubmit={submitProposal}
                >
                  <MDBModalBody>
                    <MDBInput
                      name="proposalTarget"
                      value={proposalTarget.value}
                      onChange={changeHandler}
                      label="Enter receiver contract id"
                      group
                    >
                      <div className="invalid-feedback">
                        {proposalTarget.message}
                      </div>
                    </MDBInput>
                    <MDBInput
                      name="proposalDescription"
                      value={proposalDescription.value}
                      onChange={changeHandler}
                      required
                      label="Enter description"
                      group
                    >
                      <div className="invalid-feedback">
                        {proposalDescription.message}
                      </div>
                    </MDBInput>
                    <MDBInput
                      name="proposalCustomMethodName"
                      value={proposalCustomMethodName.value}
                      onChange={changeHandler}
                      label="Method Name"
                      required
                      group
                    >
                      <div className="invalid-feedback">
                        {proposalCustomMethodName.message}
                      </div>
                    </MDBInput>
                    <MDBInput
                      type="textarea"
                      rows={10}
                      name="proposalCustomArgs"
                      value={proposalCustomArgs.value}
                      onChange={changeHandler}
                      label="Args in JSON format"
                      required
                      group
                    >
                      <div className="invalid-feedback">
                        {proposalCustomArgs.message}
                      </div>
                    </MDBInput>
                    <MDBInput
                      name="proposalCustomDeposit"
                      value={proposalCustomDeposit.value}
                      onChange={changeHandler}
                      label="Deposit in NEAR"
                      required
                      group
                    >
                      <div className="invalid-feedback">
                        {proposalCustomDeposit.message}
                      </div>
                    </MDBInput>
                    {daoPolicy ? (
                      <>
                        <MDBAlert color="warning">
                          You will pay a deposit of{" "}
                          <span style={{ fontSize: 13 }}>Ⓝ</span>
                          {new Decimal(daoPolicy.proposal_bond.toString())
                            .div(yoktoNear)
                            .toFixed(2)}{" "}
                          to add this proposal!
                        </MDBAlert>
                      </>
                    ) : null}
                    <MDBBox className="text-muted font-small ml-2">
                      *the deposit will be refunded if proposal rejected or
                      expired.
                    </MDBBox>
                  </MDBModalBody>
                  <MDBModalFooter className="justify-content-center">
                    <MDBBtn color="elegant" type="submit">
                      Submit
                      {showSpinner ? (
                        <div
                          className="spinner-border spinner-border-sm ml-2"
                          role="status"
                        >
                          <span className="sr-only">Loading...</span>
                        </div>
                      ) : null}
                    </MDBBtn>
                  </MDBModalFooter>
                </form>
              </MDBModal>

              {/* --------------------------------------------------------------------------------------------------- */}
              {/* --------------------------------------- near.social ----------------------------------------------- */}
              {/* --------------------------------------------------------------------------------------------------- */}
              <MDBModal
                isOpen={newProposalNearSocialPost}
                toggle={toggleNearSocialPost}
                centered
                position="center"
                size="lg"
              >
                <MDBModalHeader
                  className="text-center stylish-color white-text border-dark"
                  titleClass="w-100 font-weight-bold"
                  toggle={toggleNearSocialPost}
                >
                  near.social Post
                </MDBModalHeader>
                <form
                  className="needs-validation mx-3 grey-text"
                  name="newProposalNearSocialPost"
                  noValidate
                  method="post"
                  onSubmit={submitProposal}
                >
                  <MDBModalBody>
                    <MDBInput
                      name="proposalDescription"
                      value={proposalDescription.value}
                      onChange={changeHandler}
                      required
                      label="Enter description"
                      group
                    >
                      <div className="invalid-feedback">
                        {proposalDescription.message}
                      </div>
                    </MDBInput>
                    <MdEditor
                      name="proposalCustomArgs"
                      renderHTML={(text) => mdParser.render(text)}
                      onChange={handleEditorChange}
                      onImageUpload={handleEditorImageUpload}
                    />
                    <div className="invalid-feedback">
                      {proposalCustomArgs.message}
                    </div>
                    <MDBInput
                      name="proposalCustomDeposit"
                      value={proposalCustomDeposit.value}
                      onChange={changeHandler}
                      label="Deposit in NEAR"
                      required
                      group
                    >
                      <div className="invalid-feedback">
                        {proposalCustomDeposit.message}
                      </div>
                    </MDBInput>
                    {daoPolicy ? (
                      <>
                        <MDBAlert color="warning">
                          You will pay a deposit of{" "}
                          <span style={{ fontSize: 13 }}>Ⓝ</span>
                          {new Decimal(daoPolicy.proposal_bond.toString())
                            .div(yoktoNear)
                            .toFixed(2)}{" "}
                          to add this proposal!
                        </MDBAlert>
                      </>
                    ) : null}
                    <MDBBox className="text-muted font-small ml-2">
                      *the deposit will be refunded if proposal rejected or
                      expired.
                    </MDBBox>
                  </MDBModalBody>
                  <MDBModalFooter className="justify-content-center">
                    <MDBBtn color="elegant" type="submit">
                      Submit
                      {showSpinner ? (
                        <div
                          className="spinner-border spinner-border-sm ml-2"
                          role="status"
                        >
                          <span className="sr-only">Loading...</span>
                        </div>
                      ) : null}
                    </MDBBtn>
                  </MDBModalFooter>
                </form>
              </MDBModal>
            </>
          ) : null}
          {selectDao ? (
            <Selector setShowError={setShowError} setSelectDao={setSelectDao} />
          ) : null}
          {showLoading && !selectDao ? <Loading /> : null}
        </MDBContainer>
        <Footer />
      </MDBView>
    </>
  );
};

export default Dao;
