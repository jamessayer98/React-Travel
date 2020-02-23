import React, { useEffect } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
  Container,
  Paper,
  TableContainer,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { PlanActions } from '../../../store/actions';
import { requestPending } from '../../../helpers/request';
import { ActionTypes, RouteURLs } from '../../../constants';
import Loading from '../../../components/Loading';
import TableToolbar from '../../../components/TableToolbar';
import TravelTable from '../../../components/TravelTable';
import FilterToolbar from '../../../components/FilterToolbar';
import useDebounce from './useDebounce';

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(5),
  },
}));

const PlansList = (props) => {
  const classes = useStyles();
  const { planStatus, plans, filterParams, history, getPlans } = props;

  useEffect(() => {
    getPlans();
  }, []);

  // useEffect(() => {
  //   getPlans(filterParams.toJS());
  // }, [filterParams]);
  
  // Now we call our hook, passing in the current searchTerm value.
  // The hook will only return the latest value (what we passed in) ...
  // ... if it's been more than 500ms since it was last called.
  // Otherwise, it will return the previous value of searchTerm.
  // The goal is to only have the API call fire when user stops typing ...
  // ... so that we aren't hitting our API rapidly.
  const debouncedSearchTerm = useDebounce(filterParams, 500);

  // Here's where the API call happens
  // We use useEffect since this is an asynchronous action
  useEffect(
    () => {
      // Make sure we have a value (user has entered something in input)
      if (debouncedSearchTerm) {
        getPlans(filterParams.toJS());
      }
    },
    // This is the useEffect input array
    // Our useEffect function will only execute if this value changes ...
    // ... and thanks to our hook it will only change if the original ...
    // value (searchTerm) hasn't changed for more than 500ms.
    [debouncedSearchTerm]
  );

  const handleAddPlan = () => {
    history.push(RouteURLs.ADD_PLAN);
  };

  return (
    <>
      <Container maxWidth="lg">
        <TableContainer className={classes.root} component={Paper}>
          <TableToolbar title="Your travel plans" handleAction={handleAddPlan} withAction />
          <FilterToolbar />
          {planStatus !== requestPending(ActionTypes.GET_PLANS) ? (
            <TravelTable plans={plans} />
          ) : (
            <Loading />
          )}
        </TableContainer>
      </Container>
    </>
  );
};

const mapStateToProps = (state) => ({
  planStatus: state.getIn(['plan', 'status']),
  plans: state.getIn(['plan', 'plans']),
  filterParams: state.getIn(['plan', 'filterParams']),
});

const mapDispatchToProps = {
  getPlans: PlanActions.getPlans,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withRouter,
)(PlansList);
