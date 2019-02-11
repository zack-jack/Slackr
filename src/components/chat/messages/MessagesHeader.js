import React, { Component } from 'react';
import { Header, Segment, Input, Icon } from 'semantic-ui-react';

class MessagesHeader extends Component {
  render() {
    const {
      channelName,
      isPrivateChannel,
      numUniqueUsers,
      handleSearchChange,
      searchLoading,
      handleFavorite,
      isChannelFavorited
    } = this.props;

    return (
      <Segment clearing className="messages__header">
        <Header
          fluid="true"
          as="h2"
          floated="left"
          className="messages__channel"
        >
          <span>
            {channelName}
            {!isPrivateChannel && (
              <Icon
                name={isChannelFavorited ? 'star' : 'star outline'}
                color={isChannelFavorited ? 'yellow' : 'black'}
                onClick={handleFavorite}
                style={{ marginLeft: '0.5rem' }}
              />
            )}
          </span>

          <Header.Subheader className="messages__subheader">
            {numUniqueUsers}
          </Header.Subheader>
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
