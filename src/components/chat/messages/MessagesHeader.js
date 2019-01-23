import React, { Component } from 'react';
import { Header, Segment, Input, Icon } from 'semantic-ui-react';

class MessagesHeader extends Component {
  render() {
    const {
      channelName,
      isPrivateChannel,
      numUniqueUsers,
      handleSearchChange,
      searchLoading
    } = this.props;

    return (
      <Segment clearing>
        <Header fluid="true" as="h2" floated="left">
          <span>
            {channelName}
            {!isPrivateChannel && <Icon name="star outline" color="black" />}
          </span>

          <Header.Subheader>{numUniqueUsers}</Header.Subheader>
        </Header>

        <Header floated="right">
          <Input
            name="search"
            size="mini"
            icon="search"
            placeholder="Search Messages"
            loading={searchLoading}
            onChange={handleSearchChange}
          />
        </Header>
      </Segment>
    );
  }
}

export default MessagesHeader;
