import React, { FormEvent, useState, useContext, useEffect } from "react";
import { Segment, Form, Button, Grid } from "semantic-ui-react";
import { ActivityFormValues } from "../../../app/models/activity";
import { v4 as uuid } from "uuid";
import ActivityStore from "../../../app/stores/activityStore";
import { observer } from "mobx-react-lite";
import { RouteComponentProps } from "react-router";
import { Form as FinalForm, Field } from "react-final-form";
import TextInput from "../../../app/common/form/TextInput";
import TextAreaInput from "../../../app/common/form/TextAreaInput";
import SelectInput from "../../../app/common/form/SelectInput";
import { category } from "../../../app/common/options/categoryOptions";
import DateInput from "../../../app/common/form/DateInput";
import { combineDateAndTime } from "../../../app/common/util/util";
import { combineValidators, isRequired, composeValidators, hasLengthGreaterThan } from "revalidate";

const validate = combineValidators({
  title:isRequired({message:'The event title is required'}),
  category:isRequired('Category'),
  description:composeValidators(
    isRequired('Description'),
    hasLengthGreaterThan(4)({message:'Description needs to be at least 5 characters'})
  )(),
  city:isRequired('City'),
  venue:isRequired('Venue'),
  date:isRequired('Date'),
  time:isRequired('Time')
})

interface DetailParams {
  id: string;
}

const ActivityForm: React.FC<RouteComponentProps<DetailParams>> = ({
  match,
  history,
}) => {
  const activityStore = useContext(ActivityStore);
  const {
    createActivity,
    editActivity,
    submitting,
    loadActivity
  } = activityStore;

  const [activity, setActivity] = useState(new ActivityFormValues());

const [loading,setLoading]=useState(false);

  useEffect(() => {
    if (match.params.id ) {
      setLoading(true);
      loadActivity(match.params.id).then(
        (activity) => setActivity(new ActivityFormValues(activity))
      ).finally(()=>setLoading(false));
    }
  }, [
    loadActivity,
    match.params.id,
  ]);

  // const handleSubmit = () => {
  //   if (activity.id.length === 0) {
  //     let newActivity = {
  //       ...activity,
  //       id: uuid(),
  //     };
  //     createActivity(newActivity).then(() =>
  //       history.push(`/activities/${newActivity.id}`)
  //     );
  //   } else {
  //     editActivity(activity).then(() =>
  //       history.push(`/activities/${activity.id}`)
  //     );
  //   }
  // };

  const handleFinalFormSubmit = (values: any) => {
    const dateAndTime = combineDateAndTime(values.date,values.time);
    const {date,time,...activity} = values;
    activity.date = dateAndTime;
    if (!activity.id) {
          let newActivity = {
            ...activity,
            id: uuid(),
          };
          createActivity(newActivity);
        } else {
          editActivity(activity);
        }
  };

  // const handleInputChange = (
  //   event: FormEvent<HTMLInputElement | HTMLTextAreaElement>
  // ) => {
  //   const { name, value } = event.currentTarget;
  //   setActivity({ ...activity, [name]: value });
  // };


  return (
    <Grid>
      <Grid.Column width={10}>
        <Segment clearing>
          <FinalForm
           validate={validate}
           initialValues={activity}
            onSubmit={handleFinalFormSubmit}
            render={({ handleSubmit,invalid,pristine }) => (
              <Form onSubmit={handleSubmit} loading={loading}>
                <Field
                  component={TextInput}
                  name="title"
                  placeholder="Title"
                  value={activity.title}
                />
                <Field
                  component={TextAreaInput}
                  name="description"
                  placeholder="Description"
                  value={activity.description}
                />
                <Field
                  component={SelectInput}
                  options={category}
                  name="category"
                  placeholder="Category"
                  value={activity.category}
                />
                <Form.Group>
                  <Field
                    name="date"
                    date={true}
                    placeholder="Date"
                    value={activity.date}
                    component={DateInput}
                  />
                   <Field
                    name="time"
                    time={true}
                    placeholder="Time"
                    value={activity.time}
                    component={DateInput}
                  />
                </Form.Group>
                <Form.Input
                  name="city"
                  placeholder="City"
                  value={activity.city}
                  component={TextInput}
                />
                <Form.Input
                  name="venue"
                  placeholder="Venue"
                  value={activity.venue}
                  component={TextInput}
                />
                <Button
                  loading={submitting}
                  disabled={loading || invalid || pristine}
                  positive
                  floated="right"
                  type="submit"
                  content="submit"
                />
                <Button
                  onClick={activity.id
                    ?()=>history.push(`/activities/${activity.id}`)
                    :()=>history.push(`/activities`)
                }
                  disabled={loading}
                  floated="right"
                  type="button"
                  content="Cancel"
                />
              </Form>
            )}
          />
        </Segment>
      </Grid.Column>
    </Grid>
  );
};

export default observer(ActivityForm);
