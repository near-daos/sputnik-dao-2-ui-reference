import React, { useEffect, useState } from 'react';
import { Contract } from 'near-api-js';
import Pagination from './Pagination';

import {
  MDBBox,
  MDBBtn,
  MDBCard,
  MDBCardBody,
  MDBCardHeader,
  MDBCol,
  MDBIcon,
  MDBRow
} from 'mdbreact';
import { useGlobalMutation, useGlobalState } from '../../utils/container';
import useRouter from '../../utils/use-router';
import { Decimal } from 'decimal.js';
import { timestampToReadable, yoktoNear } from '../../utils/funcs';
import Loading from '../../utils/Loading';
import { login, accountExists, nearConfig } from '../../utils/utils';
import NewDao from './NewDao';

const DaoInfo = (props) => {
  const contractId = props.item;
  const [council, setCouncil] = useState([]);
  const [daoConfig, setDaoConfig] = useState(null);
  const [daoPolicy, setDaoPolicy] = useState(null);
  const [collapseState, setCollapseState] = useState(false);
  const [daoState, setDaoState] = useState(null);
  const [daoExists, setDaoExists] = useState(true);

  const contract = new Contract(window.walletConnection.account(), contractId, {
    viewMethods: [
      'get_config',
      'get_policy',
      'get_staking_contract',
      'get_available_amount',
      'delegation_total_supply',
      'get_last_proposal_id'
    ],
    changeMethods: []
  });

  useEffect(() => {
    if (contractId !== '') {
      accountExists(contractId)
        .then((r) => {
          setDaoExists(r);
        })
        .catch((e) => {
          console.log(e);
        });
    }
  }, [props.item]);

  /*
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


      useEffect(
        () => {
          contract.get_config().then((data) => {
            setDaoConfig(data);
          });
        }, [props])

      useEffect(
        () => {
          contract.get_policy().then((data) => {
            setDaoPolicy(data);
          });
        }, [props])
      */

  const toggleLoadData = () => {
    setCollapseState(!collapseState);
  };

  return (
    <>
      <MDBCard
        className="m-3"
        key={props.i}
        color="grey darken-1"
        style={{
          borderTopLeftRadius: 25,
          borderTopRightRadius: 25,
          borderBottomLeftRadius: 25,
          borderBottomRightRadius: 25
        }}
      >
        {daoExists ? (
          <MDBCardHeader
            color="white-text stylish-color"
            className="h5-responsive"
            style={{ borderTopLeftRadius: 25, borderTopRightRadius: 25 }}
          >
            <div>
              <div className="float-left mt-2">
                {props.item.replace('.' + nearConfig.contractName, '')}
              </div>
              <div className="float-right">
                <MDBBtn disabled color="grey" size="sm" onClick={toggleLoadData}>
                  View <MDBIcon icon={!collapseState ? 'arrow-down' : 'arrow-up'} />
                </MDBBtn>
                <MDBBtn
                  name={props.item}
                  onClick={props.handleSelect}
                  color="elegant"
                  size="sm"
                  className="float-right"
                >
                  SELECT
                </MDBBtn>
              </div>
              <div className="clearfix" />
            </div>
          </MDBCardHeader>
        ) : (
          <MDBCardHeader
            color="white-text stylish-color"
            className="h5-responsive"
            style={{ borderTopLeftRadius: 25, borderTopRightRadius: 25 }}
          >
            <div>
              <div className="float-left mt-2">#{props.i} DAO removed</div>
            </div>
          </MDBCardHeader>
        )}
        {collapseState && daoExists ? (
          <MDBCardBody
            className="grey darken-1 white-text"
            style={{ borderBottomLeftRadius: 25, borderBottomRightRadius: 25 }}
          >
            <div className="text-left">
              <MDBCard color="special-color-dark" className="mx-auto mb-2">
                <MDBCardBody className="text-left">
                  <h6 className="grey-text" color="light">
                    {daoConfig ? daoConfig.purpose : null}
                  </h6>
                  <div className="float-right h4-responsive">Ⓝ {daoState}</div>
                </MDBCardBody>
              </MDBCard>
              <div>
                <MDBCard color="special-color-dark" className="mx-auto">
                  <MDBCardBody className="text-left">
                    <div className="float-left grey-text">
                      proposal bond <span style={{ fontSize: 12 }}> Ⓝ</span>
                    </div>
                    <div className="float-right">
                      {daoPolicy && daoPolicy.proposal_bond !== null
                        ? new Decimal(daoPolicy.proposal_bond.toString()).div(yoktoNear).toString()
                        : ''}
                    </div>
                    <div className="clearfix" />
                    <div className="float-left grey-text">proposal period</div>
                    <div className="float-right">
                      {daoPolicy && daoPolicy.proposal_period !== null
                        ? timestampToReadable(daoPolicy.proposal_period)
                        : ''}
                    </div>
                    <div className="clearfix" />
                    <div className="float-left grey-text">
                      bounty bond <span style={{ fontSize: 12 }}> Ⓝ</span>
                    </div>
                    <div className="float-right">
                      {daoPolicy && daoPolicy.bounty_bond !== null
                        ? new Decimal(daoPolicy.bounty_bond.toString()).div(yoktoNear).toString()
                        : ''}
                    </div>
                    <div className="clearfix" />
                    <div className="float-left grey-text">bounty forgiveness</div>
                    <div className="float-right">
                      {daoPolicy && daoPolicy.bounty_forgiveness_period !== null
                        ? timestampToReadable(daoPolicy.bounty_forgiveness_period)
                        : ''}
                    </div>
                    <div className="clearfix" />
                  </MDBCardBody>
                </MDBCard>
              </div>
              <hr />
            </div>
            <div>
              <hr />
              <MDBCol>
                {daoPolicy && daoPolicy.roles[1] && daoPolicy.roles[1].kind.Group
                  ? daoPolicy.roles[1].kind.Group.map((item, key) => (
                      <div className="text-right" key={key}>
                        {item}
                      </div>
                    ))
                  : null}
                {daoPolicy && daoPolicy.roles[0] && daoPolicy.roles[0].kind.Group
                  ? daoPolicy.roles[0].kind.Group.map((item, key) => (
                      <div className="text-right" key={key}>
                        {item}
                      </div>
                    ))
                  : null}
              </MDBCol>
            </div>
          </MDBCardBody>
        ) : null}
      </MDBCard>
    </>
  );
};

async function getDaos(fromIndex, limit) {
  return await window.factoryContract.get_daos({ from_index: fromIndex, limit: limit });
}

const Selector = (props) => {
  const routerCtx = useRouter();
  const stateCtx = useGlobalState();
  const mutationCtx = useGlobalMutation();
  const [daoList, setDaoList] = useState([]);
  const [daoCount, setDaoCount] = useState(0);
  const [daoListFixed, setDaoListFixed] = useState([]);
  const [showNewDaoModal, setShowNewDaoModal] = useState(false);
  const [fromIndex, setFromIndex] = useState(0);
  const [showLoading, setShowLoading] = useState(true);
  const daoLimit = 50;

  useEffect(() => {
    getDaos(fromIndex, daoLimit)
      .then((r) => {
        setDaoList(r);
        setShowLoading(false);
      })
      .catch((e) => {
        setShowLoading(false);
        console.log(e);
        mutationCtx.toastError(e);
      });
  }, [fromIndex]);

  useEffect(() => {
    window.factoryContract
      .get_number_daos()
      .then((r) => {
        setDaoCount(r);
        setShowLoading(false);
      })
      .catch((e) => {
        setShowLoading(false);
        console.log(e);
        mutationCtx.toastError(e);
      });
  }, []);

  const handleSelect = async (e) => {
    e.preventDefault();
    mutationCtx.updateConfig({
      contract: e.target.name,
      bond: '',
      purpose: '',
      votePeriod: '',
      lastShownProposal: 0,
      lastJsonData: 0
    });
    props.setSelectDao(false);
    routerCtx.history.push('/' + e.target.name);
    window.location.reload();
    return false;
  };

  useEffect(() => {
    if (
      window.localStorage.getItem('showNewDaoModal') &&
      JSON.parse(window.localStorage.getItem('showNewDaoModal')) === true
    ) {
      if (window.walletConnection.getAccountId()) {
        setShowNewDaoModal(!showNewDaoModal);
      }
      window.localStorage.setItem('showNewDaoModal', false);
    }
  }, [window]);

  const toggleNewDao = () => {
    if (!window.walletConnection.getAccountId()) {
      window.localStorage.setItem('showNewDaoModal', true);
      login();
      return;
    }

    setShowNewDaoModal(!showNewDaoModal);
  };

  const togglePage = (i) => {
    setFromIndex(i);
  };

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
        <MDBCardHeader className="text-center white-text">
          Please select or create DAO
          <hr color="white" />
          <MDBBtn color="grey" onClick={toggleNewDao} className="">
            CREATE NEW DAO
          </MDBBtn>
          <MDBBox className="white-text text-center">
            Attention! Required minimum 5 NEAR for the storage.
          </MDBBox>
        </MDBCardHeader>
        {showLoading ? <Loading /> : null}
        <MDBCardBody className="text-center">
          <MDBRow>
            {!showLoading && daoList
              ? daoList.map((item, key) => (
                  <MDBCol lg="6" md="12" key={key}>
                    <DaoInfo item={item} handleSelect={handleSelect} />
                  </MDBCol>
                ))
              : null}
          </MDBRow>
          <MDBRow>
            <MDBCol>
              <hr color="white" />
              <Pagination daoCount={daoCount} daoLimit={daoLimit} togglePage={togglePage} />
            </MDBCol>
          </MDBRow>
        </MDBCardBody>
      </MDBCard>
      {showNewDaoModal ? (
        <NewDao setShowError={props.setShowError} toggleNewDao={toggleNewDao} />
      ) : null}
    </div>
  );
};

export default Selector;
