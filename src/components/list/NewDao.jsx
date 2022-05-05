import React, { useState } from 'react';
import useRouter from '../../utils/use-router';
import { accountExists, nearConfig } from '../../utils/utils';
import { MDBBtn, MDBInput, MDBModal, MDBModalBody, MDBModalFooter, MDBModalHeader } from 'mdbreact';
import { Decimal } from 'decimal.js';
import { yoktoNear } from '../../utils/funcs';

const NewDao = (props) => {
  const routerCtx = useRouter();

  const [showSpinner, setShowSpinner] = useState(false);
  const [showNewDao, setShowNewDao] = useState(true);

  const [daoName, setDaoName] = useState({
    value: '',
    valid: true,
    message: ''
  });

  const [purpose, setPurpose] = useState({
    value: '',
    valid: true,
    message: ''
  });
  const [amount, setAmount] = useState({
    value: '',
    valid: true,
    message: ''
  });
  const [council, setCouncil] = useState({
    value: '',
    valid: true,
    message: ''
  });

  const toggleNewDaoModal = () => {
    setShowNewDao(!showNewDao);
  };

  const submitNewDao = async (e) => {
    e.preventDefault();
    e.persist();
    const nearAccountValid = await accountExists(council.value);

    let validatePurpose = validateField('purpose', purpose.value);
    let validateDaoName = validateField('daoName', daoName.value);
    let validateAmount = validateField('amount', amount.value);

    if (!validateDaoName) {
      e.target.daoName.className += ' is-invalid';
      e.target.daoName.classList.remove('is-valid');
    } else {
      e.target.daoName.classList.remove('is-invalid');
      e.target.daoName.className += ' is-valid';
    }

    if (!validatePurpose) {
      e.target.purpose.className += ' is-invalid';
      e.target.purpose.classList.remove('is-valid');
    } else {
      e.target.purpose.classList.remove('is-invalid');
      e.target.purpose.className += ' is-valid';
    }

    if (!validateAmount) {
      e.target.amount.className += ' is-invalid';
      e.target.amount.classList.remove('is-valid');
    } else {
      e.target.amount.classList.remove('is-invalid');
      e.target.amount.className += ' is-valid';
    }

    if (!nearAccountValid) {
      e.target.council.className += ' is-invalid';
      e.target.council.classList.remove('is-valid');
      setCouncil({ value: council.value, valid: false, message: 'user account does not exist!' });
    } else {
      setCouncil({ value: council.value, valid: true, message: '' });
      e.target.council.classList.remove('is-invalid');
      e.target.council.className += ' is-valid';
    }

    if (validatePurpose && validateAmount && nearAccountValid) {
      const argsList = {
        config: {
          name: daoName.value,
          purpose: purpose.value,
          metadata: ''
        },
        policy: [council.value]
      };

      //console.log(argsList, Buffer.from(JSON.stringify(argsList)).toString('base64'));

      try {
        setShowSpinner(true);
        const a = new Decimal(amount.value);
        const amountYokto = a.mul(yoktoNear).toFixed();
        const args = Buffer.from(JSON.stringify(argsList)).toString('base64');

        /* Add Public Key until contract is fully tested */
        await window.factoryContract.create(
          {
            name: daoName.value,
            public_key: nearConfig.pk,
            args: args
          },
          new Decimal('150000000000000').toString(),
          amountYokto.toString()
        );

        // routerCtx.history.push('/' + e.target.name);
        console.log(daoName.value);
      } catch (e) {
        console.log(e);
        props.setShowError(e);
      } finally {
        setShowSpinner(false);
      }
    }
  };

  const validatePurpose = (field, name, showMessage) => {
    if (name && name.length >= 10 && name.length <= 1280) {
      return true;
    } else {
      showMessage('Please enter between 10 and 1280 chars', 'warning', field);
      return false;
    }
  };

  const validateName = (field, name, showMessage) => {
    const allowedChars = /^(?=[0-9a-zA-Z])(?=.*[0-9a-zA-Z]$)(?!.*__.*)(?!.*--.*)[0-9a-zA-Z_\-]*$/;
    if (name && name.length >= 2 && name.length <= 35 && allowedChars.test(name)) {
      return true;
    } else {
      showMessage(
        'Please enter between 2 and 35 chars, lowercase characters (a-z), digits (0-9),(_-) can be used as separators ',
        'warning',
        field
      );
      return false;
    }
  };

  const validateAmount = (field, name, showMessage) => {
    if (name && !isNaN(name) && name >= 5) {
      return true;
    } else {
      showMessage('Minimum amount is 5 NEAR', 'warning', field);
      return false;
    }
  };

  const showMessage = (message, type, field) => {
    message = message.trim();
    if (message) {
      switch (field) {
        case 'purpose':
          setPurpose({ message: message });
          break;
        case 'daoName':
          setDaoName({ message: message });
          break;
        case 'amount':
          setAmount({ message: message });
          break;
        case 'council':
          setCouncil({ message: message });
          break;
      }
    }
  };

  const validateField = (field, value) => {
    switch (field) {
      case 'daoName':
        return validateName(field, value, showMessage.bind(this));
      case 'purpose':
        return validatePurpose(field, value, showMessage.bind(this));
      case 'amount':
        return validateAmount(field, value, showMessage.bind(this));
    }
  };

  const changeHandler = (event) => {
    if (event.target.name === 'daoName') {
      setDaoName({ value: event.target.value.toLocaleLowerCase(), valid: !!event.target.value });
    }
    if (event.target.name === 'purpose') {
      setPurpose({ value: event.target.value, valid: !!event.target.value });
    }
    if (event.target.name === 'amount') {
      setAmount({ value: event.target.value, valid: !!event.target.value });
    }
    if (event.target.name === 'council') {
      setCouncil({ value: event.target.value.toLowerCase(), valid: !!event.target.value });
    }

    if (event.target.name !== 'council') {
      if (!validateField(event.target.name, event.target.value)) {
        event.target.className = 'form-control is-invalid';
      } else {
        event.target.className = 'form-control is-valid';
      }
    } else {
      if (!validateField(event.target.name, event.target.value)) {
        event.target.className = 'form-control is-invalid';
      } else {
        event.target.className = 'form-control';
      }
    }
  };

  return (
    <MDBModal isOpen={showNewDao} toggle={() => {}} centered position="center" size="lg">
      <MDBModalHeader
        className="text-center stylish-color white-text"
        titleClassName="w-100 font-weight-bold"
        toggle={toggleNewDaoModal}
      >
        Create DAO
      </MDBModalHeader>
      <form
        className="needs-validation mx-3 grey-text"
        name="newDao"
        noValidate
        method="post"
        onSubmit={submitNewDao}
      >
        <MDBModalBody>
          <MDBInput
            name="daoName"
            value={daoName.value}
            onChange={changeHandler}
            label="Enter Name (will be prefix of .sputnikdao.near)"
            required
            group
          >
            <div className="invalid-feedback">{daoName.message}</div>
          </MDBInput>

          <MDBInput
            name="purpose"
            value={purpose.value}
            onChange={changeHandler}
            label="Enter Purpose"
            required
            group
          >
            <div className="invalid-feedback">{purpose.message}</div>
          </MDBInput>

          <MDBInput
            name="council"
            value={council.value}
            onChange={changeHandler}
            label="Enter Council Member"
            required
            group
          >
            <div className="invalid-feedback">{council.message}</div>
          </MDBInput>

          <MDBInput
            value={amount.value}
            onChange={changeHandler}
            label="Amount to transfer to the DAO (minimum 5 NEAR for storage)"
            name="amount"
            group
          >
            <div className="invalid-feedback">{amount.message}</div>
          </MDBInput>
        </MDBModalBody>
        <MDBModalFooter className="justify-content-center">
          <MDBBtn color="unique" type="submit">
            Submit
            {showSpinner ? (
              <div className="spinner-border spinner-border-sm ml-2" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            ) : null}
          </MDBBtn>
        </MDBModalFooter>
      </form>
    </MDBModal>
  );
};

export default NewDao;
