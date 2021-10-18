import React, {useEffect, useState} from 'react'
import {Contract} from "near-api-js";

import {
  MDBAlert,
  MDBBadge,
  MDBBox,
  MDBBtn,
  MDBCard,
  MDBCardBody,
  MDBCardHeader, MDBCardText, MDBCol,
  MDBContainer, MDBIcon, MDBLink, MDBMask,
  MDBModal,
  MDBModalBody,
  MDBModalFooter,
  MDBModalHeader, MDBPopover, MDBPopoverBody, MDBRow, MDBTooltip, MDBView
} from "mdbreact";
import {useGlobalState} from './utils/container'
import {convertDuration, timestampToReadable, yoktoNear} from './utils/funcs'
import Navbar from "./Navbar";
import Footer from "./Footer";
import {useParams} from "react-router-dom";
import Decimal from "decimal.js";
import ReactJson from 'react-json-view'

export const Proposal = (props) => {
  const [showSpinner, setShowSpinner] = useState(false);
  const stateCtx = useGlobalState();
  const [votedWarning, setVotedWarning] = useState(false);
  const [votes, setVotes] = useState({
    approved: 0,
    rejected: 0,
    removed: 0,
  });
  const [metadata, setMetadata] = useState(null);


  useEffect(
    () => {
      if (props.data.kind.Transfer && props.data.kind.Transfer.token_id) {
        const token = props.data.kind.Transfer.token_id.split(".");
        if (token.length === 3) {
          const tokenContract = new Contract(window.walletConnection.account(), token[1] + "." + token[2], {
            viewMethods: ['get_token'],
            changeMethods: [],
          })
          tokenContract.get_token({'token_id': token[0]}).then((r) => {
            setMetadata(r.metadata.decimals)
          });
        }
      }
    }, [])


  //console.log(props)

  const vote = async (vote) => {
    try {
      setShowSpinner(true);
      await window.contract.act_proposal({
        id: props.id,
        action: vote,
      }, new Decimal("300000000000000").toString())
    } catch (e) {
      console.log(e);
      props.setShowError(e);
    } finally {
      setShowSpinner(false);
    }
  }

  const finalize = async () => {
    try {
      setShowSpinner(true);
      await window.contract.act_proposal({
        id: props.id,
        action: "Finalize"
      })
    } catch (e) {
      console.log(e);
      props.setShowError(e);
    } finally {
      setShowSpinner(false);
    }
  }

  const handleVoteYes = () => {

    if (props.data.votes[window.walletConnection.getAccountId()] === undefined) {
      vote('VoteApprove').then().catch((e) => {
        console.log(e);
      });
    } else {
      setVotedWarning(true);
    }
  }

  const handleVoteNo = () => {
    if (props.data.votes[window.walletConnection.getAccountId()] === undefined) {
      vote('VoteReject').then().catch((e) => {
        console.log(e);
      });
    } else {
      setVotedWarning(true);
    }
  }
  const handleVoteRemove = () => {
    if (props.data.votes[window.walletConnection.getAccountId()] === undefined) {
      vote('VoteRemove').then().catch((e) => {
        console.log(e);
      });
    } else {
      setVotedWarning(true);
    }
  }

  const handleFinalize = () => {
    finalize().then().catch((e) => {
      console.log(e);
    });
  }

  const toggleVoteWarningOff = () => {
    setVotedWarning(false);
  }


  useEffect(
    () => {
      if (props.data.votes && Object.keys(props.data.votes).length !== 0) {
        let vrj = 0;
        let vap = 0;
        let vrm = 0;

        Object.keys(props.data.votes).map((item, key) => {
          if (props.data.votes[item] === 'Reject') {
            vrj = vrj + 1;
          }

          if (props.data.votes[item] === 'Approve') {
            vap = vap + 1;
          }

          if (props.data.votes[item] === 'Remove') {
            vrm = vrm + 1;
          }

        })

        setVotes({
          approved: vap,
          rejected: vrj,
          removed: vrm,
        })

      }
    },
    [props.data.votes]
  )

  let jsonError = false;
  if (props.data.kind.FunctionCall && props.data.kind.FunctionCall.actions[0]) {
    try {
      JSON.parse(atob(props.data.kind.FunctionCall.actions[0].args))
    } catch (e) {
      jsonError = true;
      console.log(e);
    }
  }

  const canVote = (permission) => !!window.walletConnection.getAccountId() && props.daoPolicy.roles
    .some(role => 
      (role.kind === "Everyone" || role.kind.Group.includes(window.walletConnection.getAccountId()))
      && role.permissions.includes(permission));

  const canApprove = canVote("*:VoteApprove");
  const canReject = canVote("*:VoteReject");
  const canRemove = canVote("*:VoteRemove");

  return (
    <>
      {props.data.kind ?
        <MDBCol className="col-12 col-sm-8 col-lg-6 mx-auto">
          <MDBModal modalStyle="danger" centered size="sm" isOpen={votedWarning} toggle={toggleVoteWarningOff}>
            <MDBModalHeader>Warning!</MDBModalHeader>
            <MDBModalBody className="text-center">
              You are already voted
            </MDBModalBody>
            <MDBModalFooter>
              <MDBBtn className="w-100" color="info" onClick={toggleVoteWarningOff}>Close</MDBBtn>
            </MDBModalFooter>
          </MDBModal>

          <MDBCard className="mb-5 stylish-color white-text">
            <MDBCardHeader className="text-center h4-responsive">

              {props.data.kind === 'ChangeConfig' ? "Change Config: " : null}
              {props.data.kind === 'ChangePolicy' ? "Change Policy: " : null}
              {props.data.kind.AddMemberToRole && props.data.kind.AddMemberToRole.role === 'council' ? "Add " + props.data.kind.AddMemberToRole.member_id + " to the council" : null}
              {props.data.kind.RemoveMemberFromRole && props.data.kind.RemoveMemberFromRole.role === 'council' ? "Remove " + props.data.kind.RemoveMemberFromRole.member_id + " from the council" : null}
              {props.data.kind.Transfer && props.data.kind.Transfer.token_id === "" ? "Request for payout " + "Ⓝ" + (props.data.kind.Transfer.amount / yoktoNear).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " to " + props.data.kind.Transfer.receiver_id : null}
              {metadata && props.data.kind.Transfer && props.data.kind.Transfer.token_id !== "" ? "Request for payout " + props.data.kind.Transfer.token_id.split(".")[0].toUpperCase() + (new Decimal(props.data.kind.Transfer.amount).div("1e" + metadata)).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " to " + props.data.kind.Transfer.receiver_id : null}
              {props.data.kind.FunctionCall && props.data.kind.FunctionCall.actions[0].method_name === 'create_token' ? "Create token" : null}
              {props.data.kind === 'UpgradeSelf' ? "UpgradeSelf: " + props.data.target : null}
              {props.data.kind === 'UpgradeRemote' ? "UpgradeRemote: " + props.data.kind.UpgradeRemote.receiver_id : null}
              {props.data.kind === 'Transfer' ? "Transfer: " + props.data.target : null}
              {props.data.kind === 'SetStakingContract' ? "SetStakingContract: " + props.data.target : null}
              {props.data.kind === 'AddBounty' ? "AddBounty: " + props.data.target : null}
              {props.data.kind === 'BountyDone' ? "BountyDone: " + props.data.target : null}
              {props.data.kind === 'Vote' ? "Vote: " + props.data.target : null}

              {/*
          {props.data.kind.type === "Payout" ?
            <div>
              <div className="float-left">
                Payout:
              </div>
              <div className="float-right font-weight-bold" style={{fontSize: 25}}>
                <span style={{fontSize: 22, marginRight: 2}}>Ⓝ</span>
                {(props.data.kind.amount / yoktoNear).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              </div>
            </div>
            : null}
          <div className="clearfix"/>
          */}

            </MDBCardHeader>
            <MDBCardBody className="white-text">
              <div className="float-left">
                {jsonError ?
                  <MDBAlert color="danger" className="font-small text-center">This proposal is unknown type, and can't be properly displayed</MDBAlert>
                  : null}
                {props.data.kind.AddMemberToRole || props.data.kind.RemoveMemberFromRole ?
                  <MDBIcon icon="user-secret" className="white-text mr-2 d-inline-block" size="2x"/> : null}

                {props.data.kind.FunctionCall && props.data.kind.FunctionCall.actions[0].method_name === 'create_token' ?
                  <MDBIcon icon="tractor" className="white-text mr-2 d-inline-block" size="2x"/> : null}

                {props.data.kind.FunctionCall && props.data.kind.FunctionCall && props.data.kind.FunctionCall.actions[0].method_name !== 'create_token' ?
                  <MDBIcon icon="cogs" className="white-text mr-2 d-inline-block" size="2x"/> : null}

                {props.data.kind.Transfer && props.data.kind.Transfer.token_id === "" ?
                  <><MDBIcon icon="money-check-alt" className="white-text mr-2 d-inline-block" size="2x"/>
                    <span style={{fontSize: 32, marginRight: 6}}>Ⓝ</span></> : null}

                {props.data.kind.Transfer && props.data.kind.Transfer.token_id !== "" ?
                  <><MDBIcon icon="money-check-alt" className="white-text mr-2 d-inline-block" size="2x"/>
                    <span style={{fontSize: 32, marginRight: 6}}>FT</span></> : null}

                {props.data.status === 'Rejected' ?
                  <MDBBadge color="danger">Rejected</MDBBadge>
                  :
                  null
                }
                {props.data.status === 'Approved' ?
                  <><MDBBadge color="green">Approved</MDBBadge>{" "}<MDBIcon
                    className="amber-text" size="2x"
                    icon="crown"/></>
                  :
                  null
                }
                {props.data.status === 'InProgress' && convertDuration(new Decimal(props.data.submission_time).plus(props.daoPolicy.proposal_period)) >= new Date() ?
                  <MDBBadge color="green">In Progress</MDBBadge>
                  :
                  null
                }
                {props.data.status === 'Expired' || (props.data.status === 'InProgress' && convertDuration(new Decimal(props.data.submission_time).plus(props.daoPolicy.proposal_period)) < new Date()) ?
                  <MDBBadge color="amber">Expired</MDBBadge>
                  :
                  null
                }
                {props.data.status === 'Removed' ?
                  <MDBBadge color="yellow">Removed</MDBBadge>
                  :
                  null
                }
              </div>
              <div className="float-right h4-responsive"><a className="white-text btn-link"
                href={"#/" + props.dao + "/" + props.id}><MDBIcon
                  icon="link"/></a> #{props.id}</div>
              <div className="clearfix"/>
              <MDBCardText>
                <MDBBox
                  className="h4-responsive white-text">{props.data.description.split('/t/')[0]}</MDBBox>
                {props.data.description.split('/t/')[1] ?
                  <a target="_blank" className="white-text btn-link"
                    href={"https://gov.near.org/t/" + props.data.description.split('/t/')[1]}
                    rel="nofollow">{"https://gov.near.org/t/" + props.data.description.split('/t/')[1]}</a>
                  : null}
                <hr/>

                {/* PROPOSER */}
                <div className="float-left text-muted h4-responsive">
                  {props.data.kind.FunctionCall && props.data.kind.FunctionCall.actions[0].method_name === 'create_token' ? "token factory" : "proposer"}
                </div>
                {!jsonError && props.data.kind.FunctionCall && props.data.kind.FunctionCall.actions[0] && props.data.kind.FunctionCall.actions[0].method_name === 'create_token' && JSON.parse(atob(props.data.kind.FunctionCall.actions[0].args)).args ?
                  <MDBBox className="float-right h4-responsive" style={{width: '50%'}}>
                    <a className="text-right float-right white-text btn-link" target="_blank"
                      style={{wordBreak: "break-word"}}
                      href={stateCtx.config.network.explorerUrl + "/accounts/" + props.data.kind.FunctionCall.receiver_id.toLowerCase()}>{props.data.kind.FunctionCall.receiver_id.toLowerCase()}</a>
                  </MDBBox>
                  :
                  <MDBBox className="float-right h4-responsive" style={{width: '50%'}}>
                    <a className="text-right float-right white-text btn-link" target="_blank"
                      style={{wordBreak: "break-word"}}
                      href={stateCtx.config.network.explorerUrl + "/accounts/" + props.data.proposer.toLowerCase()}>{props.data.proposer.toLowerCase()}</a>
                  </MDBBox>
                }

                {/* TARGET */}
                <br/>
                <div className="clearfix"/>
                <div className="float-left text-muted h4-responsive">
                  {props.data.kind.FunctionCall && props.data.kind.FunctionCall.actions[0].method_name === 'create_token' ? "owner" : "target"}
                </div>
                {!jsonError && props.data.kind.FunctionCall && props.data.kind.FunctionCall.actions[0].method_name !== 'create_token' && props.data.kind.FunctionCall.actions[0] && atob(props.data.kind.FunctionCall.actions[0].args) ?
                  <>
                    <MDBBox className="float-right h4-responsive" style={{width: '80%'}}>
                      <a className="text-right float-right white-text btn-link" target="_blank"
                        style={{wordBreak: "break-word"}}
                        href={stateCtx.config.network.explorerUrl + "/accounts/" + props.data.kind.FunctionCall.receiver_id}>
                        {props.data.kind.FunctionCall.receiver_id}</a>
                    </MDBBox>
                  </>
                  : null}

                {!jsonError && props.data.kind.FunctionCall && props.data.kind.FunctionCall.actions[0].method_name === 'create_token' && JSON.parse(atob(props.data.kind.FunctionCall.actions[0].args)).args ?
                  <>
                    <MDBBox className="float-right h4-responsive" style={{width: '80%'}}>
                      <a className="text-right float-right white-text btn-link" target="_blank"
                        style={{wordBreak: "break-word"}}
                        href={stateCtx.config.network.explorerUrl + "/accounts/" + JSON.parse(atob(props.data.kind.FunctionCall.actions[0].args)).args.owner_id}>
                        {JSON.parse(atob(props.data.kind.FunctionCall.actions[0].args)).args.owner_id}</a>
                    </MDBBox>
                    <MDBBox className="float-left h5-responsive white-text" style={{width: '80%'}}>
                      total
                      supply:{" "}{new Decimal(JSON.parse(atob(props.data.kind.FunctionCall.actions[0].args)).args.total_supply).div(new Decimal(10).pow(JSON.parse(atob(props.data.kind.FunctionCall.actions[0].args)).args.metadata.decimals)).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </MDBBox>
                    <MDBBox className="float-left h5-responsive white-text" style={{width: '80%'}}>
                      decimals:{" "}{JSON.parse(atob(props.data.kind.FunctionCall.actions[0].args)).args.metadata.decimals}
                    </MDBBox>
                    <MDBBox className="float-left h5-responsive white-text" style={{width: '80%'}}>
                      name:{" "}{JSON.parse(atob(props.data.kind.FunctionCall.actions[0].args)).args.metadata.name}
                    </MDBBox>
                    <MDBBox className="float-left h5-responsive white-text" style={{width: '80%'}}>
                      symbol:{" "}{JSON.parse(atob(props.data.kind.FunctionCall.actions[0].args)).args.metadata.symbol}
                    </MDBBox>
                  </> : null}

                {props.data.kind.AddMemberToRole ?
                  <>
                    <MDBBox className="float-right h4-responsive" style={{width: '80%'}}>
                      <a className="text-right float-right white-text btn-link" target="_blank"
                        style={{wordBreak: "break-word"}}
                        href={stateCtx.config.network.explorerUrl + "/accounts/" + props.data.kind.AddMemberToRole.member_id}>
                        {props.data.kind.AddMemberToRole.member_id}</a>
                    </MDBBox>
                  </> : null}

                {props.data.kind.RemoveMemberFromRole ?
                  <>
                    <MDBBox className="float-right h4-responsive" style={{width: '80%'}}>
                      <a className="text-right float-right white-text btn-link" target="_blank"
                        style={{wordBreak: "break-word"}}
                        href={stateCtx.config.network.explorerUrl + "/accounts/" + props.data.kind.RemoveMemberFromRole.member_id}>
                        {props.data.kind.RemoveMemberFromRole.member_id}</a>
                    </MDBBox>
                  </> : null}

                {props.data.kind.Transfer ?
                  <>
                    <MDBBox className="float-right h4-responsive" style={{width: '80%'}}>
                      <a className="text-right float-right white-text btn-link" target="_blank"
                        style={{wordBreak: "break-word"}}
                        href={stateCtx.config.network.explorerUrl + "/accounts/" + props.data.kind.Transfer.receiver_id}>
                        {props.data.kind.Transfer.receiver_id}</a>
                    </MDBBox>
                  </> : null}

                {props.data.kind.UpgradeRemote ?
                  <>
                    <MDBBox className="float-right h4-responsive" style={{width: '80%'}}>
                      <a className="text-right float-right white-text btn-link" target="_blank"
                        style={{wordBreak: "break-word"}}
                        href={stateCtx.config.network.explorerUrl + "/accounts/" + props.data.kind.UpgradeRemote.receiver_id}>
                        {props.data.kind.UpgradeRemote.receiver_id}</a>
                    </MDBBox>
                  </> : null
                }

                {/*
                  <MDBBox className="float-right h4-responsive" style={{width: '80%'}}>
                    <a className="text-right float-right white-text btn-link" target="_blank" style={{wordBreak: "break-word"}}
                       href={stateCtx.config.network.explorerUrl + "/accounts/" + props.data.kind.AddMemberToRole.member_id}>{props.data.kind.AddMemberToRole.member_id}</a>
                  </MDBBox>
                */}
                <div className="clearfix"/>

                {props.data.kind.Transfer ?
                  <>
                    <div className="float-left text-muted h4-responsive">
                      amount
                    </div>
                    <MDBBox className="float-right h4-responsive white-text">
                      {(props.data.kind.Transfer.token_id) === "" ?
                        "Ⓝ" + (props.data.kind.Transfer.amount / yoktoNear).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        :
                        <>
                          {metadata && props.data.kind.Transfer.token_id ? props.data.kind.Transfer.token_id + " " + ((new Decimal(props.data.kind.Transfer.amount).div("1e" + metadata)).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")) : null}
                        </>
                      }
                    </MDBBox>
                    <br/>
                    <div className="clearfix"/>
                  </>
                  : null}

                {!jsonError && props.data.kind.FunctionCall && props.data.kind.FunctionCall.actions[0] && atob(props.data.kind.FunctionCall.actions[0].args) ?
                  <>
                    <div className="float-left text-muted h4-responsive">
                      deposit
                    </div>
                    <MDBBox className="float-right h4-responsive white-text">
                      {new Decimal(props.data.kind.FunctionCall.actions[0].deposit).div(yoktoNear).toString()}
                    </MDBBox>
                    <br/>
                    <div className="clearfix"/>
                    <div className="float-left text-muted h4-responsive">
                      method
                    </div>
                    <MDBBox className="float-right h4-responsive white-text">
                      <samp className="font-small">{props.data.kind.FunctionCall.actions[0].method_name}</samp>
                    </MDBBox>
                    <br/>
                    <div className="clearfix"/>
                    <div className="float-left text-muted h4-responsive">
                      args
                    </div>
                    <MDBBox className="float-right h4-responsive white-text">
                      <MDBCard style={{maxWidth: 500}}>
                        <ReactJson collapsed={true} displayDataTypes={false} displayArrayKey={false} name={false}
                          theme="tomorrow" style={{wordBreak: 'break-all'}}
                          src={JSON.parse(atob(props.data.kind.FunctionCall.actions[0].args))}/>
                      </MDBCard>
                    </MDBBox>
                    <br/>
                    <div className="clearfix"/>
                  </>
                  : null}


              </MDBCardText>

              {canApprove ?
                <MDBTooltip
                  tag="span"
                  placement="top"
                >
                  <MDBBtn
                    style={{borderRadius: 50}}
                    disabled={showSpinner || convertDuration(new Decimal(props.data.submission_time).plus(props.daoPolicy.proposal_period)) < new Date() || props.data.status !== 'InProgress'}
                    onClick={handleVoteYes}
                    floating
                    color="green darken-1"
                    className='h5-responsive'
                    size="sm">
                    <MDBIcon icon='thumbs-up' size="2x" className='white-text m-2 p-2'/>
                  </MDBBtn>
                  <span>Vote YES</span>
                </MDBTooltip>
                : null}

              {(window.walletConnection.getAccountId() && convertDuration(new Decimal(props.data.submission_time).plus(props.daoPolicy.proposal_period)) < new Date() && props.data.status === 'InProgress') ?
                <MDBTooltip
                  tag="span"
                  placement="top"
                >
                  <MDBBtn
                    style={{borderRadius: 50}}
                    disabled={showSpinner}
                    onClick={handleFinalize}
                    color="info"
                    floating
                    className='h5-responsive float-right'
                    size="sm">
                    <MDBIcon icon="check-circle" size="2x" className='white-text m-2 p-2'/>
                  </MDBBtn>
                  <span>Finalise</span>
                </MDBTooltip>
                : null}

              {canReject ?
                <MDBTooltip
                  tag="span"
                  placement="top"
                >
                  <MDBBtn
                    style={{borderRadius: 50}}
                    disabled={showSpinner || convertDuration(new Decimal(props.data.submission_time).plus(props.daoPolicy.proposal_period)) < new Date() || props.data.status !== 'InProgress'}
                    onClick={handleVoteNo}
                    color="red"
                    floating
                    className='h5-responsive float-right'
                    size="sm">
                    <MDBIcon icon='thumbs-down' size="2x" className='white-text m-2 p-2'/>
                  </MDBBtn>
                  <span>Vote NO</span>
                </MDBTooltip>
                : null}

              {canRemove ?
                <MDBTooltip
                  tag="span"
                  placement="top"
                >
                  <MDBBtn
                    style={{borderRadius: 50}}
                    disabled={showSpinner || convertDuration(new Decimal(props.data.submission_time).plus(props.daoPolicy.proposal_period)) < new Date() || props.data.status !== 'InProgress'}
                    onClick={handleVoteRemove}
                    color="amber"
                    floating
                    className='h5-responsive float-right'
                    size="sm">
                    <MDBIcon icon='trash-alt' size="2x" className='white-text m-2 p-2'/>
                  </MDBBtn>
                  <span>Remove Proposal</span>
                </MDBTooltip>
                : null}

            </MDBCardBody>
            <div className='rounded-bottom mdb-color text-center pt-3 pl-5 pr-5'>
              <ul className='list-unstyled list-inline font-small'>
                <li className='list-inline-item pr-2 white-text h4-responsive'>
                  <MDBIcon far
                    icon='clock'/>{" "}{convertDuration(new Decimal(props.data.submission_time).plus(props.daoPolicy.proposal_period)).toLocaleDateString()} {convertDuration(new Decimal(props.data.submission_time).plus(props.daoPolicy.proposal_period)).toLocaleTimeString()}
                </li>

                <li className='list-inline-item pr-2'>
                  <div>
                    {props.data.votes !== undefined && Object.keys(props.data.votes).length !== 0 && Object.values(props.data.votes).includes('Approve') ?
                      <MDBPopover
                        placement="top"
                        popover
                        clickable
                        domElement='div'
                        id="popover1"
                      >
                        <div className="d-inline-block">
                          <MDBIcon icon='thumbs-up' size="2x" className='lime-text mr-1'/>
                        </div>
                        <div>
                          <MDBPopoverBody>
                            <div className="h4-responsive">
                              {
                                Object.keys(props.data.votes).map((item, key) => (
                                  <>
                                    {props.data.votes[item] === 'Approve' ?
                                      <li key={key}>{item}</li>
                                      : null
                                    }
                                  </>
                                ))

                              }
                            </div>
                          </MDBPopoverBody>
                        </div>
                      </MDBPopover>
                      :
                      <MDBIcon icon='thumbs-up' size="2x" className='lime-text mr-1'/>
                    }
                    <span className="white-text h3-responsive">{votes.approved}</span>
                  </div>
                </li>

                <li className='list-inline-item pr-2'>
                  <div>
                    {props.data.votes !== undefined && Object.keys(props.data.votes).length !== 0 && Object.values(props.data.votes).includes('Remove') ?
                      <MDBPopover
                        placement="top"
                        popover
                        clickable
                        domElement='div'
                        id="popover1"
                      >
                        <div className="d-inline-block">
                          <MDBIcon icon='trash-alt' size="2x" className='amber-text mr-1'/>
                        </div>
                        <div>
                          <MDBPopoverBody>
                            <div className="h4-responsive">
                              {
                                Object.keys(props.data.votes).map((item, key) => (
                                  <>
                                    {props.data.votes[item] === 'Remove' ?
                                      <li key={key}>{item}</li>
                                      : null
                                    }
                                  </>
                                ))

                              }
                            </div>
                          </MDBPopoverBody>
                        </div>
                      </MDBPopover>
                      :
                      <MDBIcon icon='trash-alt' size="2x" className='amber-text mr-1'/>
                    }
                    <span className="white-text h3-responsive">{votes.removed}</span>
                  </div>
                </li>

                <li className='list-inline-item pr-2'>
                  <div>
                    {props.data.votes !== undefined && Object.keys(props.data.votes).length !== 0 && Object.values(props.data.votes).includes('Reject') ?
                      <MDBPopover
                        placement="top"
                        popover
                        clickable
                        domElement='div'
                        id="popover1"
                      >
                        <div className="d-inline-block">
                          <MDBIcon icon='thumbs-down' size="2x" className='red-text mr-1'/>
                        </div>
                        <div>
                          <MDBPopoverBody>
                            <div className="h4-responsive">
                              {
                                Object.keys(props.data.votes).map((item, key) => (
                                  <>
                                    {props.data.votes[item] === 'Reject' ?
                                      <li key={key}>{item}</li>
                                      : null
                                    }
                                  </>
                                ))

                              }
                            </div>
                          </MDBPopoverBody>
                        </div>
                      </MDBPopover>
                      :
                      <MDBIcon icon='thumbs-down' size="2x" className='red-text mr-1'/>
                    }
                    <span className="white-text h3-responsive">{votes.rejected}</span>
                  </div>
                </li>

              </ul>
            </div>
          </MDBCard>
          {/*<QuestionModal show={showModal} text={modalText} handleVoteYes={handleVoteYes}/>*/}
        </MDBCol>
        : null}
    </>
  )


}

const ProposalPage = () => {
  const [proposals, setProposals] = useState(null);
  const [daoPolicy, setDaoPolicy] = useState([]);

  let {dao, proposal} = useParams();
  const [showError, setShowError] = useState(null);


  useEffect(
    () => {
      window.contract = new Contract(window.walletConnection.account(), dao, {
        viewMethods: [
          'get_config', 'get_policy', 'get_staking_contract', 'get_available_amount', 'delegation_total_supply',
          'get_proposals', 'get_last_proposal_id', 'get_proposal', 'get_bounty', 'get_bounties', 'get_last_bounty_id',
          'get_bounty_claims', 'get_bounty_number_of_claims', 'delegation_balance_of', 'has_blob'
        ],
        changeMethods: ['add_proposal', 'act_proposal'],
      })
    },
    [dao]
  )


  useEffect(
    () => {
      window.contract.get_policy()
        .then(r => {
          setDaoPolicy(r);
        }).catch((e) => {
          console.log(e);
          setShowError(e);
        })
    },
    [dao]
  )

  useEffect(
    () => {
      window.contract.get_proposals({from_index: parseInt(proposal), limit: 1})
        .then(list => {
          const t = []
          list.map((item, key) => {
            const t2 = {}
            Object.assign(t2, {key: key}, item);
            t.push(t2);
          })
          setProposals(t);
        })
    },
    [dao, proposal]
  )

  return (
    <>
      {
        (daoPolicy && daoPolicy.roles) ?
          <MDBView className="w-100 h-100" style={{minHeight: "100vh"}}>
            <MDBMask className="d-flex justify-content-center grey lighten-2 align-items-center gradient"/>
            <Navbar/>
            <MDBContainer style={{minHeight: "100vh"}} className="mt-5">
              <MDBCol className="col-12 col-sm-8 col-lg-6 mx-auto mb-3">
                <MDBCard className="stylish-color-dark">
                  <MDBCardBody className="text-left p-4 m-4 white-text">
                    <MDBBox><b>Proposal DAO:</b> {dao}</MDBBox>
                    {
                      daoPolicy && daoPolicy.roles
                      ? daoPolicy.roles.filter(role => role.name !== "all").map(role => 
                        <MDBBox><b>{role.name}:</b>
                          {role.kind.Group.map((item, key) => <div
                            key={key}>{item}</div>)}
                        </MDBBox>
                      )
                      : null
                    }
                    <hr/>
                    <MDBLink to={"/" + dao} className="elegant-color white-text text-center">BACK TO DAO</MDBLink>
                  </MDBCardBody>
                </MDBCard>
              </MDBCol>

              {proposals !== null ?
                proposals.map((item, key) => (
                  <Proposal data={item} key={parseInt(proposal)} id={parseInt(proposal)} setShowError={setShowError}
                    dao={dao}
                    daoPolicy={daoPolicy}/>
                ))
                : null
              }

              {proposals !== null && proposals.length === 0 ?
                <MDBCard className="text-center p-4 m-4">
                  <MDBBox>Sorry, nothing was found</MDBBox>
                </MDBCard>
                : null}

            </MDBContainer>
            <Footer/>
          </MDBView>
          : null
      }
    </>
  );

}

export default ProposalPage;


